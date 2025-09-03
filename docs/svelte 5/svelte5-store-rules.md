# Svelte 5 Store Generation Rules for AI Coding Assistants

## Overview
When generating Svelte 5 stores, follow these strict patterns to ensure proper reactivity, performance, and maintainability. These rules apply to Cursor AI, GitHub Copilot, VSCode extensions, and similar AI coding assistants.

## ✅ MANDATORY Store Structure Pattern

```javascript
class [StoreName]Store {
  // 1. ALWAYS declare $state first
  [property] = $state([initialValue]);
  
  // 2. Then declare $derived values (pure functions only)
  [derivedProperty] = $derived([computation]);
  
  // 3. Finally, declare methods for state updates
  [methodName]() {
    // State mutations here
  }
}

// 4. ALWAYS export a single instance
export const [storeName] = new [StoreName]Store();
```

## 🔴 STRICT PROHIBITIONS

### ❌ NEVER do these in Svelte 5 stores:

1. **No `writable()` or `derived()` imports**
   ```javascript
   // ❌ WRONG - These are deprecated in Svelte 5
   import { writable, derived } from 'svelte/store';
   ```

2. **No side effects in $derived**
   ```javascript
   // ❌ WRONG - No state mutations in derived
   derivedValue = $derived.by(() => {
     this.someState = "modified"; // FORBIDDEN
     return value;
   });
   ```

3. **No $effect in class constructors or class body**
   ```javascript
   // ❌ WRONG - $effect only works in components
   constructor() {
     $effect(() => { /* This will error */ });
   }
   ```

4. **No direct property assignment in derived**
   ```javascript
   // ❌ WRONG - Causes infinite loops
   name = $derived(this.count > 3 ? (this.status = "High") : "Low");
   ```

## ✅ REQUIRED Patterns

### 1. State Declaration
```javascript
// ✅ Simple values
count = $state(0);
name = $state("default");
isActive = $state(true);

// ✅ Objects and arrays
user = $state({ id: 1, name: "User" });
items = $state([]);
config = $state({ theme: "dark", lang: "en" });
```

### 2. Derived Values (Pure Functions Only)
```javascript
// ✅ Simple derived
isEven = $derived(this.count % 2 === 0);
displayName = $derived(`Hello, ${this.name}!`);

// ✅ Multi-dependency derived
summary = $derived(`${this.name}: ${this.count} items`);

// ✅ Complex derived with $derived.by
complexData = $derived.by(() => {
  const processed = this.items.map(item => ({
    ...item,
    processed: true
  }));
  
  return {
    processed,
    count: processed.length,
    hasItems: processed.length > 0
  };
});
```

### 3. State Update Methods
```javascript
// ✅ Simple updates
increment() {
  this.count++;
}

// ✅ Object updates
updateUser(newData) {
  this.user = { ...this.user, ...newData };
}

// ✅ Array updates
addItem(item) {
  this.items = [...this.items, item];
}

removeItem(id) {
  this.items = this.items.filter(item => item.id !== id);
}
```

## 📝 File Naming Convention

```javascript
// File: stores/[feature].svelte.js (note .svelte.js extension)
// Example: stores/counter.svelte.js, stores/user.svelte.js
```

## 🎯 Complete Template

When asked to create a Svelte 5 store, ALWAYS use this template:

```javascript
// [storeName].svelte.js
class [CapitalizedName]Store {
  // State properties
  [property1] = $state([defaultValue1]);
  [property2] = $state([defaultValue2]);
  
  // Derived properties (pure functions only)
  [derived1] = $derived([computation1]);
  [derived2] = $derived([computation2]);
  
  // Complex derived (if needed)
  [complexDerived] = $derived.by(() => {
    // Only computations, no side effects
    const result = /* computation */;
    return result;
  });
  
  // Update methods
  [updateMethod1]([params]) {
    this.[property1] = [newValue];
  }
  
  [updateMethod2]([params]) {
    this.[property2] = [newValue];
  }
  
  reset() {
    this.[property1] = [defaultValue1];
    this.[property2] = [defaultValue2];
  }
}

export const [storeName] = new [CapitalizedName]Store();
```

## 🚨 Error Prevention Rules

1. **ALWAYS check**: If user mentions `writable` or `derived`, suggest Svelte 5 runes instead
2. **ALWAYS validate**: Derived values must be pure (no assignments, no console.logs, no API calls)
3. **ALWAYS remind**: Effects belong in components, not stores
4. **ALWAYS use**: Class-based pattern for complex stores
5. **ALWAYS export**: Single instance, not the class itself

## 🔍 Code Review Checklist

Before generating store code, verify:

- [ ] No `import { writable, derived }` statements
- [ ] All state uses `$state()`
- [ ] All derived values are pure functions
- [ ] No `$effect` in store class
- [ ] Methods properly update state
- [ ] Single instance exported
- [ ] File has `.svelte.js` extension

## 💡 Usage in Components

When generating component code that uses stores:

```javascript
// ✅ In component
<script>
  import { storeName } from './stores/[name].svelte.js';
  
  // Effects belong here, not in store
  $effect(() => {
    if (storeName.someProperty > 5) {
      console.log('Side effect here');
    }
  });
</script>

<!-- Use store properties directly -->
<div>{storeName.derivedValue}</div>
<button onclick={storeName.updateMethod}>Update</button>
```

## 🎨 Advanced Patterns

### Multiple Related Stores
```javascript
// ✅ Separate concerns
export const userStore = new UserStore();
export const settingsStore = new SettingsStore();
export const cartStore = new CartStore();
```

### Store with Async Operations
```javascript
class DataStore {
  data = $state([]);
  loading = $state(false);
  error = $state(null);
  
  // Derived
  hasData = $derived(this.data.length > 0);
  
  // Async method
  async loadData() {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await fetch('/api/data');
      this.data = await response.json();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
}
```

## 🏁 Summary

When generating Svelte 5 stores:
1. **Use classes** with `$state` and `$derived`
2. **Keep derived pure** - no side effects
3. **Put effects in components** - never in stores
4. **Export instances** - not classes
5. **Follow naming conventions** - `.svelte.js` files
6. **Validate patterns** - check against prohibited practices

This ensures generated stores are performant, maintainable, and follow Svelte 5 best practices.