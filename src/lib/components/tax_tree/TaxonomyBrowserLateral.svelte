<script>

//@ts-nocheck
    /* let {taxonomyTree} = $props(); */
    import TaxonomyGroup from './TaxonomyGroup.svelte';
    import { getTaxonomyFlatList,getFlatTaxonomy } from './taxonomyTree.js';

    import { _taxonomyTreeStore } from '$lib/stores/svelte5_stores/taxonomyTreeStore.svelte.js';



    //@ts-nocheck
    /* eslint-disable */

    //@ts-ignore

    /* import { Accordion } from '@bits-ui/accordion'; */
    import { Accordion } from "bits-ui";

    import { untrack } from 'svelte';


    let taxonomyTree = $state(null);
let isLoading = $state(true);
let error = $state(null);

function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

$effect(()=>{
  if(taxonomyTree === null && isLoading){
    console.log('Fetching taxonomic tree data...');

    //fetch('./src/lib/taxonomic_tree_images_wikipedia_final.json')
    fetch('/data/new_sources/taxonomic_tree_images_wikipedia_final.json')
    .then(response => {

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
          .then(data => {
        console.log(data,'data from TaxonomyBrowser');

        // Recursive function to add num_children and parents to each node
        function addChildrenCount(node, parentNames = []) {
          const modifiedNode = { ...node };

          // Add num_children field
          modifiedNode.num_children = node.children ? node.children.length : 0;
          modifiedNode.path = `${node.level}-${crypto.randomUUID()}`;

          // Add parents array (excluding root)
          modifiedNode.parents = node.name === 'Root' ? [] : [...parentNames];

          // Recursively process children if they exist
          if (node.children && node.children.length > 0) {
            // Create new parent names array for children
            const newParentNames = node.name === 'Root' ? [] : [...parentNames, node.name];
            modifiedNode.children = node.children.map(child => addChildrenCount(child, newParentNames));
          }

          return modifiedNode;
        }

        // Apply the modification to the entire data structure
        const modifiedData = addChildrenCount(data);
        _taxonomyTreeStore.TreeData = modifiedData;
        taxonomyTree = modifiedData;
        console.log(modifiedData,'modifiedData from Taxonomy_new')

      isLoading = false;
      error = null;
    })
    .catch(err => {
      console.error('Error fetching taxonomic_tree_images.json:', err);
      error = err.message;
      isLoading = false;
    });
  }
})
let containerEl;
/* let cols = $state(5);
let rows = $state(8);
let cardWidth = $state(0);
let cardHeight = $state(0); */



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


  $effect(()=>{


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
        _taxonomyTreeStore.paramsFilter.lastClickedItem = lastClickedItem;
        _taxonomyTreeStore.setFilteredTaxonomy(filteredTaxonomy);
        console.log('Updated store with:', filteredTaxonomy.name);


        // Use untrack to prevent this assignment from triggering the effect again
        untrack(() => {
          processedItem = lastClickedItem;
        });
      }
    }
  });

  </script>
<!-- <h3>{_taxonomyTreeStore.paramsFilter.FilteredTaxonomy?.children?.length}</h3>
{clickedItem.length>0?`<p>Clicked item: ${clickedItem.join('/')}</p>`:null} -->


<div class="flex flex-row">

    {#if taxonomyTree === null && isLoading}
    <div class="loading">
      <p>Loading taxonomic data...</p>
    </div>
    {:else if error}
    <div class="error">
      <p>Error loading data: {error}</p>
    </div>
    {:else if taxonomyTree}
    <Accordion.Root class="w-full"
    bind:value={clickedItem} type='multiple'
    >
      {#each taxonomyTree.children as group, i}

        <TaxonomyGroup {group} {clickedItem} {lastClickedItem} isTopLevel {i}/>

      {/each}
    </Accordion.Root>
    {/if}
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