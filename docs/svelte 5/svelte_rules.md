# Svelte 5 Best Practices for State Management

## Introduction

Svelte 5 introduces **runes** - a new signal-powered reactivity system that revolutionizes state management. While traditional stores (`writable`, `readable`, `derived`) are still supported for backward compatibility, runes provide a more intuitive and performant approach to reactive state.

This guide outlines best practices for state management in Svelte 5, covering when to use runes vs stores and how to migrate effectively.

Refer to these links if necessary. Let me know in the cat if you are using them and which one of them
### https://fenilsonani.com/articles/svelte-5-runes-reactive-revolution
### https://umaranis.com/2025/05/28/svelte-reactivity-beyond-the-basics/
### https://frontendmasters.com/blog/fine-grained-reactivity-in-svelte-5/
### https://github.com/mark7p/svelte-5-cheatsheet?tab=readme-ov-file#props
## Core Principles

### 1. Prefer Runes Over Stores for New Development

**✅ Do: Use runes for new components**
In Svelte 4, object reactivity required explicit reassignment for updates to be detected (e.g., obj = obj after mutation). Svelte 5’s $state rune eliminates this need by using Proxies, making object mutations inherently reactive. This results in cleaner code and better performance due to fine-grained updates

```javascript
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  Count: {count}, Doubled: {doubled}
</button>
```

**❌ Avoid: Using stores when runes suffice**
```javascript
// Unnecessary complexity with stores
import { writable, derived } from 'svelte/store';

let count = writable(0);
let doubled = derived(count, $count => $count * 2);
```

### 2. When to Use Each Approach

#### Use Runes When:
- Building new components or applications
- State is component-scoped or shared between closely related components
- You need fine-grained reactivity
- Working with classes and complex objects
- Performance is critical

#### Use Stores When:
- Working with legacy Svelte 4 codebases during migration
- State needs to be shared across many unrelated components
- Building reusable libraries that must support both Svelte 4 and 5
- Interfacing with external libraries that expect store-like APIs

## State Management Patterns

### Local Component State

Use `$state` for component-local reactive state:

```javascript
<script>
  // Simple state
  let name = $state('');
  let age = $state(0);

  // Complex state (deeply reactive)
  let user = $state({
    profile: {
      name: '',
      email: ''
    },
    preferences: {
      theme: 'light'
    }
  });

  // Arrays are deeply reactive too
  let todos = $state([
    { id: 1, text: 'Learn Svelte 5', done: false }
  ]);
</script>


<script>
  let items = $state([]);
  function addItem() {
    let item = { name: 'Item' };
    items.push(item); // Svelte makes item reactive
    item.name = 'Changed'; // Won’t trigger reactivity; use items[0] instead
    items[0].name = 'Changed'; // Correct, triggers reactivity
  }
</script>


```

### Derived State

Use `$derived` instead of `derived` stores:

```javascript
<script>
  let user = $state({ name: 'John', age: 30 });
  let summary = $derived(`${user.name} is ${user.age} years old`);
</script>
<p>{summary}</p>

<script>
  let firstName = $state('');
  let lastName = $state('');

  // Simple derivation
  let fullName = $derived(`${firstName} ${lastName}`);

  // Complex derivation with $derived.by
  let stats = $derived.by(() => {
    const words = fullName.split(' ').length;
    const characters = fullName.length;
    return { words, characters };
  });
</script>
```

### Cross-Component State

For sharing state between components, use state in `.svelte.js` modules:

```javascript
// state.svelte.js
export const appState = $state({
  user: null,
  theme: 'light',
  notifications: []
});

export function setUser(user) {
  appState.user = user;
}

export function addNotification(message) {
  appState.notifications.push({
    id: crypto.randomUUID(),
    message,
    timestamp: Date.now()
  });
}
```

### Side Effects

Use `$effect` instead of reactive statements or store subscriptions:

```javascript
<script>
  let count = $state(0);

  // Log changes
  $effect(() => {
    console.log(`Count is now: ${count}`);
  });

  // API calls
  let userId = $state(null);
  let userData = $state(null);

  $effect(() => {
    if (userId) {
      fetch(`/api/users/${userId}`)
        .then(r => r.json())
        .then(data => userData = data);
    }
  });

  // Cleanup with teardown function
  $effect(() => {
    const interval = setInterval(() => {
      console.log('Periodic task');
    }, 1000);

    return () => clearInterval(interval);
  });
</script>
```
Svelte effects, such as $effect.pre, $effect.sync, and $effect.active, are designed to run within specific lifecycle phases of a Svelte component, such as component initialization or during updates. Using them outside these contexts, like in a regular JavaScript module or within a function that isn't part of an effect chain, will result in this error

USING EFFECTS IN A FILE with svelte.js or just .js file will raise an error
```
<script>

$effect(() => {
	const currentRemoteData = get(remoteDataStore);


</script>
```
## Performance Best Practices

### 1. Use Raw State for Large, Immutable Data

```javascript
<script>
  // For large arrays/objects you won't mutate
  let bigData = $state.raw(massiveDataArray);

  // Update by replacement, not mutation
  function updateData() {
    bigData = [...bigData, newItem];
  }
</script>
```

### 2. Avoid Effects for Simple State Synchronization

**❌ Don't use effects for simple derivations**
```javascript
let count = $state(0);
let doubled = $state();

// Bad: unnecessary effect
$effect(() => {
  doubled = count * 2;
});
```

**✅ Use derived state instead**
```javascript
let count = $state(0);
let doubled = $derived(count * 2);
```

### 3. Use `untrack` to Break Dependency Chains

```javascript
<script>
  let a = $state(0);
  let b = $state(0);

  $effect(() => {
    // This effect only runs when 'a' changes
    console.log('A changed:', a);

    // Reading 'b' inside untrack won't create a dependency
    untrack(() => {
      console.log('B is currently:', b);
    });
  });
</script>
```

## Class-Based State

Svelte 5 provides excellent support for reactive classes:

```javascript
<script>
  class TodoManager {
    todos = $state([]);
    filter = $state('all');

    constructor() {
      this.load();
    }

    get filteredTodos() {
      return $derived(() => {
        switch (this.filter) {
          case 'active': return this.todos.filter(t => !t.done);
          case 'completed': return this.todos.filter(t => t.done);
          default: return this.todos;
        }
      });
    }

    add(text) {
      this.todos.push({
        id: crypto.randomUUID(),
        text,
        done: false
      });
    }

    toggle(id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) todo.done = !todo.done;
    }

    async load() {
      this.todos = await fetch('/api/todos').then(r => r.json());
    }
  }

  const manager = new TodoManager();
</script>

<input
  onkeydown={(e) => {
    if (e.key === 'Enter') {
      manager.add(e.target.value);
      e.target.value = '';
    }
  }}
/>

{#each manager.filteredTodos as todo}
  <div>
    <input
      type="checkbox"
      checked={todo.done}
      onchange={() => manager.toggle(todo.id)}
    />
    {todo.text}
  </div>
{/each}
```

## Migration Strategy

### Gradual Migration from Stores

1. **Start with leaf components** - migrate components that don't pass state to children
2. **Convert simple stores first** - `writable` stores are easiest to migrate
3. **Leave complex stores for later** - stores with complex logic can be migrated incrementally
4. **Test thoroughly** - ensure reactivity works as expected

### Store to Rune Migration Patterns

**Writable Store → $state**
```javascript
// Before
import { writable } from 'svelte/store';
export const count = writable(0);

// After
export let count = $state(0);
```

**Derived Store → $derived**
```javascript
// Before
import { derived } from 'svelte/store';
export const doubled = derived(count, $count => $count * 2);

// After
export let doubled = $derived(count * 2);
```

**Readable Store → $derived with external updates**
```javascript
// Before
import { readable } from 'svelte/store';
export const time = readable(new Date(), (set) => {
  const interval = setInterval(() => set(new Date()), 1000);
  return () => clearInterval(interval);
});

// After
let time = $state(new Date());
$effect(() => {
  const interval = setInterval(() => time = new Date(), 1000);
  return () => clearInterval(interval);
});
```

## Common Pitfalls and Solutions

### 1. Infinite Effect Loops

**❌ Problem: Reading and writing the same state in an effect**
```javascript
let count = $state(0);

$effect(() => {
  // This creates an infinite loop!
  count = count + 1;
});
```

**✅ Solution: Use untrack or reconsider the logic**
```javascript
let count = $state(0);

$effect(() => {
  const currentCount = untrack(() => count);
  // Do something that doesn't create a dependency
});
```

### 2. Destructuring Loses Reactivity

**❌ Problem: Destructured values aren't reactive**
```javascript
let state = $state({ x: 0, y: 0 });
let { x, y } = state; // These won't be reactive!
```

**✅ Solution: Access properties directly or use derived**
```javascript
let state = $state({ x: 0, y: 0 });
let x = $derived(state.x);
let y = $derived(state.y);
```

### 3. Module State Export Issues

**❌ Problem: Can't export reassignable state**
```javascript
// state.svelte.js
export let count = $state(0); // This won't work!
```

**✅ Solution: Export objects or use functions**
```javascript
// state.svelte.js
export const state = $state({ count: 0 });

// Or use functions
let count = $state(0);
export const getCount = () => count;
export const setCount = (value) => count = value;
```

## Testing Considerations

When testing components with runes:

1. **State updates are synchronous** - no need to await state changes
2. **Effects run in microtasks** - may need to flush microtasks in tests
3. **Use $state.snapshot** for assertions on complex state

```javascript
import { $state } from 'svelte/store';

test('component state updates', () => {
  let count = $state(0);
  count++;
  expect(count).toBe(1); // Synchronous!
});
```

## Conclusion

Svelte 5's runes provide a more intuitive and performant approach to state management. While stores remain available for compatibility, new development should prioritize runes for their simplicity, performance, and better developer experience.

Key takeaways:
- Use `$state` for reactive state
- Use `$derived` for computed values
- Use `$effect` for side effects
- Migrate gradually from stores to runes
- Leverage classes for complex state management
- Be mindful of common pitfalls like infinite loops and destructuring

The transition to runes represents a significant step forward in Svelte's evolution, making reactive state management more accessible and powerful than ever before.
