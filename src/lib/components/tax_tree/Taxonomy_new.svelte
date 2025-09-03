<script>



    import { createTaxonomyHierarchy, getTaxonomyFlatList,getTaxonAtLevel } from './taxonomyTree.js';
    import { _taxonomyTreeStore } from '$lib/stores/svelte5_stores/taxonomyTreeStore.svelte.js';

    import TaxonomyBrowser from './TaxonomyBrowser.svelte';


let taxonomyTree = $state(null);
let isLoading = $state(true);
let error = $state(null);

function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

$effect(()=>{
  if(taxonomyTree === null && isLoading){
    console.log('Fetching taxonomic tree data...');

    fetch('./src/lib/taxonomic_tree_images_wikipedia_final.json')
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





let searchTerm = $state('');

function searchTaxonomyTree(node, searchTerm) {
  if (!node || !searchTerm) return [];

  let matches = [];
  if (node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    matches.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      matches = matches.concat(searchTaxonomyTree(child, searchTerm));
    }
  }
  return matches;
}

let filteredTaxonomy = $derived(() => {
  if (!taxonomyTree || !searchTerm) return [];
  return searchTaxonomyTree(taxonomyTree, searchTerm);
});

const handleSearch = (e) => {
  searchTerm = e.target.value;
  console.log(filteredTaxonomy,'children from taxonomy')
  console.log(searchTerm,'searchTerm from taxonomy')

}




//filterByLevel.set('genus');

 //   console.log(getByLevelArray,'getByLevelArray from taxonomy')

   /*  console.log($all_counts,'all_counts from taxonomy')

    let genusCounts = $derived($all_counts.genus_counts);

    let spTaxCounts = $derived($all_sp_tax_counts);
console.log(genusCounts,'genusCounts from taxonomy')

    console.log(spTaxCounts,'spTaxCounts from taxonomy')

    let genusCountsArray = Object.entries(genusCounts);
    console.log(genusCountsArray,'genusCountsArray from taxonomy') */
</script>

 <!-- <TaxonomyBrowser {flatTaxonomy} /> -->
  <h1>Taxonomy</h1>

  {#if isLoading}
    <div class="loading">
      <p>Loading taxonomic data...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error loading data: {error}</p>
    </div>
  {:else if taxonomyTree}
 <!--    <div class="taxonomy-browser">
      <input type="text" bind:value={searchTerm} placeholder="Search taxonomy..." oninput={handleSearch}/>
    </div> -->

    {#if searchTerm}
      <TaxonomyBrowser taxonomyTree={filteredTaxonomy}/>
    {:else}
      <TaxonomyBrowser {taxonomyTree}/>
    {/if}
  {/if}

<!--  <ul class="taxonomy-tree">
    {#each flatTaxonomy as taxon}
      <li
        class:species={taxon.level === 'species'}
        style={`padding-left: ${taxon.depth * 1.5}rem`}
      >
        <span class="taxon-name">
          {taxon.name}
          {#if taxon.level === 'species'}
            <span class="names">
              ({taxon.englishName}, {taxon.italianName})
            </span>
          {/if}
        </span>
        <span class="count">{taxon.count.toLocaleString()}</span>
      </li>
    {/each}
  </ul> -->
<!--
 {#each t as genus}
<div>
    {genus.name} {genus.count}
</div>
{/each} -->

<style>
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .error {
    text-align: center;
    padding: 2rem;
    color: #d32f2f;
    background-color: #ffebee;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .taxonomy-browser input {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
</style>