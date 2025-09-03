<script>
    // @ts-ignore
    //@ts-nocheck

     import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    // @ts-ignore
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  // @ts-ignore
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  // @ts-ignore
  import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
  let activeIndex = $state(0);
  let activeItem = $state('');
  function handleMenuButtonClick(item, i) {
    activeIndex=i;
    console.log('handleMenuButtonClickppppp',item, i,activeIndex);
		//activeItemStore.set(item);
		items = items.map((itm, index) => ({
			...itm,
			isActive: index === activeIndex ? !itm.isActive : itm.isActive
		}));
		activeItem = item;

        console.log('zzz',activeItem,items);
		//activeIndex = i;

	}

  let items=$state([
      {
        title: "Playground",
        url: "#",

        isActive: false,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        isActive: true,

        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      }])
</script>

<Sidebar.Group>
    <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
    <Sidebar.Menu>

    {#each items as item,i (item.title)}
    <!-- open={activeIndex === i}
        isActive={activeIndex === i} -->
    <Collapsible.Root
     open={item.isActive}
     class="group/collapsible">

     {#snippet child({ items })}

     <Collapsible.Trigger>

       {#snippet child({ items })}
         <button onclick={() => handleMenuButtonClick(item, i)} class="w-full">
           <Sidebar.MenuButton>
               <span>{item.title}</span>
             <ChevronRightIcon
               class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
             />
           </Sidebar.MenuButton>
         </button>
       {/snippet}
     </Collapsible.Trigger>
        <Collapsible.Content>
          <Sidebar.MenuSub>
            {#each item.items ?? [] as subItem (subItem.title)}
              <Sidebar.MenuSubItem>
                <Sidebar.MenuSubButton>
                  {#snippet child({ items })}
                    <a href={subItem.url} {...items}>
                      <span>{subItem.title}</span>
                    </a>
                  {/snippet}
                </Sidebar.MenuSubButton>
              </Sidebar.MenuSubItem>
            {/each}
          </Sidebar.MenuSub>
        </Collapsible.Content>

    {/snippet}
</Collapsible.Root>
    {/each}
</Sidebar.Menu>
</Sidebar.Group>
