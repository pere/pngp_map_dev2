<script>
  //@ts-nocheck
import CaretDown from "phosphor-svelte/lib/CaretDown";
    import { Accordion } from "bits-ui";
    import {Badge} from "$lib/components/ui/badge/index.js";

    import TaxonomyGroup from './TaxonomyGroup.svelte';
    import { _taxonomyTreeStore } from '$lib/stores/svelte5_stores/taxonomyTreeStore.svelte.js';
    // Get group from props FIRST
    let { group, isTopLevel, i, lastClickedItem, clickedItem } = $props();


    // Create a local derived group with path to avoid mutating props
    const localGroup = $derived({
        ...group,
       path: group.path || `${group.level}-${i}`,
       lastClickedItem: lastClickedItem,
       clickedItem: clickedItem
      // path:group.name
    });



$effect(()=>{
console.log('localGroup from TaxonomyGroup',localGroup)
})
    // Now you can use localGroup safely
    const isSpeciesLevel = localGroup.level === 'species';

  let isExpanded = $state(false);
  </script>


  <Accordion.Item class="font-extralight group px-1.5 ml-2 border-l-2 {localGroup?.lastClickedItem === localGroup?.path ? 'last-clicked' : ''}" lastclicked={localGroup?.lastClickedItem} test={localGroup?.path} value={localGroup?.path}

  >
    <Accordion.Header class="group-header">
      <Accordion.Trigger
        class="{localGroup.level} {!isSpeciesLevel ? 'cursor-pointer' : ''}  hover:bg-dark-10 {!isSpeciesLevel ? '[&[data-state=open]]:bg-dark-10' : ''} flex w-full flex-1 select-none items-center justify-between py-1 text-md font-light transition-all [&[data-state=open]>span>svg]:rotate-180"
        >
        {#if localGroup.image}

        {/if}
        {#if localGroup.level !== 'species'}
        <CaretDown class="size-[18px] transition-transform duration-200" />
        {/if}
        <span class="font-extralight text-sm pl-1 w-full text-left">{localGroup.name}</span>

          <span class="items-right mr-1"><Badge variant="numTaxRecords">{localGroup.count.toLocaleString()}</Badge></span>
          {#if !isSpeciesLevel}
          <span class="items-right"><Badge variant="outline">{localGroup.num_children}</Badge></span>
          {/if}
          <!-- <span class="num_children ml-2">   {localGroup.num_children}</span> -->
        <!--   <span
          class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent"
        >

        </span> -->

      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content
        class="data-content max-h-[400px] overflow-y-auto data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]"
      >
      <div class="children {localGroup?.lastClickedItem === localGroup?.path ? 'last-clicked' : ''}" lastclicked="{localGroup?.lastClickedItem} " clicked="{localGroup?.clickedItem}">
        {#if localGroup.children && localGroup.children.length > 0}
          {#each localGroup.children as child,i}
            {#if child.children}
              <!-- Recursive component for nested groups -->
              <TaxonomyGroup {lastClickedItem} {clickedItem} group={child} i={i}/>
            {:else}
              <!-- Leaf node (species) -->
              <div class="species-item">
                <span class="name">
                  {child.name}
                  {#if child.englishName || child.italianName}
                    <span class="common-names">
                      ({child.englishName}{child.italianName ? ', ' + child.italianName : ''})
                    </span>
                  {/if}
                </span>
                <Badge variant="numTaxRecords">{child.count.toLocaleString()} records</Badge>
              </div>
            {/if}
          {/each}
        {:else}
          <!-- <div class="no-children">No subcategories</div> -->
        {/if}
      </div>
    </Accordion.Content>
 <!--    <Accordion.Content class="content">
      <div class="children">
        {#each group.children as child }
          {#if child.isLeaf}
            <div class="species-item">
              <span class="name">
                {child.name}
                <span class="names">
                  ({child.englishName}, {child.italianName})
                </span>
              </span>
              <span class="count">{child.count.toLocaleString()}</span>
            </div>
          {:else}
             <TaxonomyGroup {lastClickedItem} {clickedItem} group={child} />

          {/if}
        {/each}
      </div>
    </Accordion.Content> -->
  </Accordion.Item>

  <style>
    :global(.last-clicked) {
      background: #c4c6c163 !important;
    }
    :global(.clicked) {
      /* background: #89232330!important; */
    }
    :global(.data-content[data-state=open])
    {
      /* background: #94949430!important; */
    }
:global(button.species)
{
  cursor: none;
  pointer-events: none;
  text-decoration: underline;
  color: #312e2e!important;

}
/* .hoverable:hover {
    transform: scale(3.06);
  } */

    .children {
      padding: 0.2rem 0;

    }

    .species-item {
      display: flex;
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      align-items: center;
      margin-left: 1rem;

      &:hover {
        background: #f8fafc;
      }
    }

    @keyframes slideDown {
      from { height: 0 }
      to { height: var(--radix-accordion-content-height) }
    }

    @keyframes slideUp {
      from { height: var(--radix-accordion-content-height) }
      to { height: 0 }
    }
  </style>
