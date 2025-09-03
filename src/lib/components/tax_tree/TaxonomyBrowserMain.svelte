<script>

//@ts-nocheck
    let {taxonomyTree} = $props();
    /* import TaxonomyGroup from './TaxonomyGroup.svelte'; */
    /* import { getTaxonomyFlatList,getFlatTaxonomy } from './taxonomyTree.js'; */
    import { Label } from "$lib/components/ui/label/index.js";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

    import { Button } from "$lib/components/ui/button";

    import {Badge} from "$lib/components/ui/badge/index.js";

    import { _taxonomyTreeStore } from '$lib/stores/svelte5_stores/taxonomyTreeStore.svelte.js';

    import { untrack } from 'svelte';

let this_hovered = $state(false);
let hoveredCards = $state([]);
function debounce(fn, delay = 300) {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	}
 // const debouncedHandleSelectedRadius = debounce(handleSelectedRadius, 200);

	let handleDebouncedChange = debounce(() => {
		this_hovered = !this_hovered;
	},200);

function handleHoverWiki(path) {
  if (hoveredCards.find((d)=>d.path===path)) {
    hoveredCards=hoveredCards.filter((d)=>d.path!==path);
  }
  else {
    hoveredCards=[{path:path}];
  }
  /* handleDebouncedChange(); */
  /* console.log('this_hovered',this_hovered);
  console.log('hoveredCards',hoveredCards); */
}


let containerEl;
let cols = $state(0);
let rows = $state(0);
let cardWidth = $state(0);
let cardHeight = $state(0);



    let clickedItem = $state([]);
  let lastClickedItem = _taxonomyTreeStore.paramsFilter.lastClickedItem;
  //$derived(clickedItem.slice(-1)[0]);
  let processedItem = $state(null);
let initial = false;




let toShow = $derived.by(()=>{
    if (_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length>0)
    {
      return {
        children:_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children,
        name:_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.name,
        level:_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length,
        /* cols:Math.ceil(_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length/5) */
      }

    }
    return null;
  })


let totalSlots = $derived(toShow?.children?.length);

let w = $state(0);

let h = $state(0);
let derivedGrid = $derived.by(()=>{
  if (!_taxonomyTreeStore.paramsFilter.FilteredTaxonomy) return;


    // best aspect ratio match (try to keep cards square-ish)



    initial = false;


    let temp_cols = Math.ceil(Math.sqrt(totalSlots * (w / h)));
    if (totalSlots==1 && initial)
    {
      let d= {
        cols:1,
        rows:1,
        totalSlots:1
      }
      console.warn('derivedGrid',d)
      return d
    }
  let d= {
    cols:temp_cols,
    rows:Math.floor(totalSlots / temp_cols),

    totalSlots:totalSlots
  }
  console.warn('derivedGrid calculations',d)
  return d
})
$effect(() => {
  if (typeof window !== 'undefined') {
    w = window.innerWidth;
    h = window.innerHeight;
  }
});

    let derivedCardDimensions = $derived.by(()=>{
      if (derivedGrid)
      {
        if (derivedGrid.cols==1 && derivedGrid.rows==1)
        {
          return {
            w:250,
            h:400
          }
        }
        else
        {
          return {
            w:200,
            h:250
          }
        }
      }
    })


/*   function calculateGrid() {

    const w = window.innerWidth;
    const h = window.innerHeight;

    // best aspect ratio match (try to keep cards square-ish)
    console.warn(Math.sqrt(n * w / h))
    cols = Math.ceil(Math.sqrt(n * w / h));
    rows = Math.ceil(n / cols);
    initial = false;
    totalSlots = n

    if (n==1)
    {
      cols = 1;
      rows = 1;
    }

    console.log(cols+'cols', rows+'rows', totalSlots+'totalSlots')
    debugger;
  } */

  $effect(()=>{

    if (initial)
  {
    /* calculateGrid();
    window.addEventListener("resize", calculateGrid); */
    /* window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid); */
  }
  if (_taxonomyTreeStore.paramsFilter.FilteredTaxonomy)
  {


    console.log(_taxonomyTreeStore.paramsFilter.FilteredTaxonomy,'taxonomyTreeFiltered from TaxonomyBrowserMain')
  }




})

  // Use effect with untrack to prevent cascading updates
  $effect(() => {

    console.log(toShow,'toShow from TaxonomyBrowserMain effect')
//console.log(structuredClone(toShow),'toShow from TaxonomyBrowser effect')
    console.log('Effect running - lastClickedItem:', lastClickedItem);
    console.log('Effect running - FilteredTaxonomy:', _taxonomyTreeStore.ParamsFilter.FilteredTaxonomy);

    /* calculateGrid(); */

    // Only process if item is valid, tree data exists, and we haven't processed this item yet

  });
  let maxHeightWiki = $derived(toShow?.children.length > 1 ? 'max-h-[200px]' : 'max-h-[500px]');



  </script>


  <div class="new_container w-full h-full p-2">
    {#if toShow}

    <!-- <div class="text-center">{toShow.name} ({toShow.level})</div> -->
    {/if}

<!-- <div class="border border-red-300 m-1 w-screen h-screen">
    {#if toShow}
    <div>{toShow.name} ({toShow.level})</div>
3 1 3
    console.log(cols, rows, totalSlots,'cols, rows, totalSlots from TaxonomyBrowser')
derivedGrid
    {/if} -->

  <div class="m-0 h-full w-full grid gap-y-4 gap-x-2  place-items-center"
  style="grid-template-columns: repeat({derivedGrid?.cols}, minmax(0,1fr)); grid-template-rows: repeat({derivedGrid?.rows}, 1fr);">
    {#if toShow}
      {#each toShow.children as group, i}
      {console.log(group,'group from TaxonomyBrowserMain')}
      {@const taxString=group.parents?.join(' > ')}
      {@const wikiInfo = group.wikipedia_html || 'No description available'}
      {@const cardWidth = derivedCardDimensions?.w+'px'}
      {@const cardHeight = derivedCardDimensions?.h+'px'}
      {@const isHovered = hoveredCards.find((d)=>d.path===group.path)}


<Card class="w-auto py-0 max-w-[{cardWidth}] max-h-[{cardHeight}] hover:shadow-lg transition-all duration-500 group">
  <span class="relative overflow-hidden">
    <img
      src={group.wikipedia_image?.source?group.wikipedia_image?.source:'https://placehold.co/250x350'}
      alt={group.name}
      class="w-full h-58 object-cover group-hover:scale-135 transition-transform duration-400"
    />

    <Badge variant="numTaxRecords" class="absolute top-2 left-2">{group.count.toLocaleString()} records</Badge></span>
   <!--  {#if category}
      <Badge variant="secondary" class="absolute top-2 left-2 bg-white/90">
        {category}
      </Badge>
    {/if} -->


  <CardHeader class="pb-1">
    <CardTitle class="text-lg font-bold group-hover:text-blue-600 transition-colors">
      {group.name}
    </CardTitle>

       <p class="text-sm italic text-gray-500">{taxString}</p>

  </CardHeader>

  <CardContent class="pt-0 py-0 {maxHeightWiki}  overflow-y-auto"
    onclick={()=>handleHoverWiki(group.path)}
    onmousleave={()=>handleHoverWiki(group.path)}

   >
    <p class="cursor-pointer text-sm text-gray-600 mb-4 {isHovered?'line-clamp-none':'line-clamp-4'}">{@html wikiInfo}</p>

    <div class="flex justify-between items-center">
      <div class="flex space-x-2">
        <Button variant="ghost" size="sm">♡</Button>
        <!-- <Button variant="ghost" size="sm">↗</Button> -->
      </div>
      <Button variant="outline" size="sm">Map it</Button>
    </div>
  </CardContent>
</Card>




      {/each}

    {/if}

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