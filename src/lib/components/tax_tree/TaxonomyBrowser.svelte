<script>

//@ts-nocheck
    let {taxonomyTree} = $props();
    import TaxonomyGroup from './TaxonomyGroup.svelte';
    import { getTaxonomyFlatList,getFlatTaxonomy } from './taxonomyTree.js';

    import { _taxonomyTreeStore } from '$lib/stores/svelte5_stores/taxonomyTreeStore.svelte.js';



    //@ts-nocheck
    /* eslint-disable */

    //@ts-ignore

    /* import { Accordion } from '@bits-ui/accordion'; */
    import { Accordion } from "bits-ui";
    import { enhance } from '$app/forms';
    import { untrack } from 'svelte';


let containerEl;
let cols = $state(5);
let rows = $state(8);
let cardWidth = $state(0);
let cardHeight = $state(0);



    let clickedItem = $state([]);
  let lastClickedItem = $derived(clickedItem.slice(-1)[0]);
  let processedItem = $state(null);
let initial = $state(true);

let toShow = $derived.by(()=>{
    if (_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length>0)
    {
      return {
        children:_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children,
        name:_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.name,
        level:_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length,
        cols:Math.ceil(_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length/5)
      }

    }
    return null;
  })
let n = $derived(toShow?.children?.length);
let totalSlots=n;

  function calculateGrid() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // best aspect ratio match (try to keep cards square-ish)
    cols = Math.ceil(Math.sqrt(n * w / h));
    rows = Math.ceil(n / cols);
    initial = false;
    totalSlots = n

    if (n==1)
    {
      cols = 1;
      rows = 1;
    }

    console.log(cols, rows, totalSlots,'cols, rows, totalSlots from TaxonomyBrowser')
  }

  $effect(()=>{

    if (initial)
  {
    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }
  if (_taxonomyTreeStore.paramsFilter.FilteredTaxonomy)
  console.log(_taxonomyTreeStore.paramsFilter.FilteredTaxonomy,'taxonomyTreeFiltered from taxonomy_new')

})

  // Use effect with untrack to prevent cascading updates
  $effect(() => {

//console.log(structuredClone(toShow),'toShow from TaxonomyBrowser effect')
    console.log('Effect running - lastClickedItem:', lastClickedItem);

    // Only process if item is valid, tree data exists, and we haven't processed this item yet
    if (lastClickedItem &&
        lastClickedItem !== '' &&
        lastClickedItem !== processedItem &&
        _taxonomyTreeStore.TreeData) {

      console.log('Processing new clicked item:', lastClickedItem);
      let filteredTaxonomy = _taxonomyTreeStore.findByPathId(lastClickedItem);

      if (filteredTaxonomy) {
        _taxonomyTreeStore.setFilteredTaxonomy(filteredTaxonomy);
        console.log('Updated store with:', filteredTaxonomy.name);
        calculateGrid();

        // Use untrack to prevent this assignment from triggering the effect again
        untrack(() => {
          processedItem = lastClickedItem;
        });
      }
    }
  });



  function calculateGridOld() {


    if (!containerEl) return;

    const containerWidth = containerEl.clientWidth - 32; // padding
    const containerHeight = containerEl.clientHeight - 32;

    // Calculate optimal card size based on grid dimensions
    const maxCardWidth = Math.floor(containerWidth / cols) - 16; // gap
    const maxCardHeight = Math.floor(containerHeight / rows) - 16;

    // Maintain aspect ratio but fit within constraints
    const aspectRatio = 4/5; // width/height ratio for cards

    if (maxCardWidth / aspectRatio <= maxCardHeight) {
      cardWidth = maxCardWidth;
      cardHeight = maxCardWidth / aspectRatio;
    } else {
      cardHeight = maxCardHeight;
      cardWidth = maxCardHeight * aspectRatio;
    }
  }

  </script>
<h3>{_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length}</h3>
{clickedItem.length>0?`<p>Clicked item: ${clickedItem.join('/')}</p>`:null}
<div class="flex gap-2 mt-4">
<!--   {#each [1, 2, 3, 4, 5, 6] as num}
    <button
      class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      onclick={() => columns = num}
    >
      {num} cols
    </button>
  {/each}
</div> -->
<!-- {#if clickedItem}
  <p>Clicked item: {clickedItem}</p>
{/if} -->
<div class="flex flex-row">


    <Accordion.Root class="ml-10 w-full sm:max-w-[100%]"
    bind:value={clickedItem}
    >
      {#each taxonomyTree.children as group, i}

        <TaxonomyGroup {group} isTopLevel {i}/>

      {/each}
    </Accordion.Root>
  </div>
  <div class="new_container w-screen h-screen">
    {#if toShow}
    <div class="text-center">{toShow.name} ({toShow.level})</div>
    {/if}

<!-- <div class="border border-red-300 m-1 w-screen h-screen">
    {#if toShow}
    <div>{toShow.name} ({toShow.level})</div>
    {/if} -->

  <div class="border border-red-300 m-1 h-full w-full grid gap-1 place-items-center"
  style="grid-template-columns: repeat({cols}, minmax(0,1fr)); grid-template-rows: repeat({rows}, 1fr);">
    {#if toShow}
      {#each toShow.children as group, i}
      <div class="flex flex-col items-center place-items-center gap-1 align-center border border-blue-300 h-full max-w-[250px] max-h-[350px]">
        <h2 class="text-lg font-semibold text-center mb-1">
          {group.name}
        </h2>
        <div class="border border-green-300 w-full " style="height: 40%">
          <div  class="overflow-hidden w-full h-full flex items-center justify-center">
            <img
              src={group.wikipedia_image?.source?group.wikipedia_image?.source:'https://placehold.co/250x350'}
              alt="{group.name}"
              class="h-full w-auto object-fill rounded-lg shadow"
            />
          </div>
        </div>
        <div class="flex-1 flex items-center justify-center border border-red-300">
          <p class="text-sm text-gray-600 text-center px-2 max-h-40 overflow-y-auto">
            {@html group.wikipedia_html?group.wikipedia_html:'No description available'}
          </p>
        </div>
      </div>


      {/each}

    {/if}

</div>

</div>

</div>

  <style>
    .taxonomy-browser {

      margin: 0 auto;
      font-family: 'Inter', sans-serif;
    }

    .controls {
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .accordion-root {

      border-radius: 8px;
      overflow: hidden;
    }
  </style>