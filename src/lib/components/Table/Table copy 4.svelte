<script>
    //@ts-nocheck
    //@ts-nocheck
    import { TableHandler, Datatable ,ThSort, ThFilter, Pagination, RowsPerPage, Search}  from '@vincjo/datatables'
    //import {Table_Header} from './Table_Header.svelte'
    import Header                       from './Table_Header.svelte'
    //import Header                       from './Table_Header.svelte'

   // import Header                       from './Table_Header.svelte'
    import Footer                       from './Table_Footer.svelte'
    import Th                           from './Table_Th.svelte'

    import { Checkbox }                 from '$lib/components/ui/checkbox/index.js'



    import { capitalize, glyph, ellipse } from './utils'


    //getting random limited species data, must be dynamic based ona php call
    import { species, getFilteredSpecies, loadSpecies } from '$lib/stores/datatables/species.svelte.js'
    import { onMount } from 'svelte';
import { get } from 'svelte/store';
    import { remoteDataStore,filteredTaxInputStore,selGrid,paramsFilter } from '../../stores/new_sidebar_stores.js';


    //this loads taxa definitions
    import { getTaxData,findTaxById,tax_data_joined_store } from '$lib/stores/test.svelte.js';
    // Load species data
    /* $effect(() => {

        loadSpecies();
    }); */
    let tableData=$state([]);
    let taxDataObjs;


    onMount(() => {
    //loadSpecies();
    taxDataObjs=getTaxData();
    console.log('table mounted taxDataObjs',taxDataObjs);
    console.log('table mounted tax_data_joined_store',tax_data_joined_store);

    //these are all tax data info
 /*    {
    "id": 120,
    "species_n": "Streptopelia decaocto",
    "preferred_common_name": "Eurasian Collared-Dove",
    "iconic_taxon_name": "Aves",
    "wikipedia_url": "http://en.wikipedia.org/wiki/Eurasian_collared_dove",
    "matched_term": "Streptopelia decaocto",
    "medium_url": "https://static.inaturalist.org/photos/61919353/medium.jpeg",
    "pngp_data": null
} */
    console.log('table mounted getTaxData',getTaxData());
    /* console.warn('getPlottedData',getPlottedData()) */

    /* {
    "id": 2,
    "species_n": "Parus ater",
    "preferred_common_name": "Coal Tit",
    "iconic_taxon_name": "Aves",
    "wikipedia_url": "http://en.wikipedia.org/wiki/Coal_tit",
    "matched_term": "Parus ater",
    "medium_url": "https://inaturalist-open-data.s3.amazonaws.com/photos/436734934/medium.jpg",
    "pngp_data": {
      "tax_id": 2,
      "obs_count": 1190,
      "tax_level": "species",
      "name_it": "Cincia mora",
      "name_eng": "Coal tit",
      "species_n": "Parus ater",
      "genus_n": "Parus",
      "family_n": "Paridae",
      "order_n": "Passeriformes",
      "class_n": "Aves"
    }
  }, */
  });

         // Create a reactive variable to track paramsFilter
 // let paramsFilterValue = $state($paramsFilter);
//let allids=$state($paramsFilter.allIds);
let allids=$derived.by(()=>{
  console.log('allids',$paramsFilter.allIds)
  return $paramsFilter.allIds
});

let search=$state(null);
  // Update the reactive variable when the store changes
  $effect(() => {
    /* if (table)
    search = table.createSearch(['year','month','species_n','name_it','valley']) */
;
    if (allids.length>0)
    console.log('allids.length',allids.length)
    //paramsFilterValue = $paramsFilter;
  });

let previousAllIds = $state([]);
let hasChanged=false;
let showTable=false;

/* let showTable_derived=$derived.by(()=>{
  return hasChanged
}); */
  // React to paramsFilter.allIds changes and make PHP call
  $effect(() => {
    if (!taxDataObjs || taxDataObjs.length==0 && allids.length>0) {
      taxDataObjs=getTaxData();
      console.log('table mounted taxDataObjs  in effect',taxDataObjs);

    }
    if (allids.length>0 ){
      console.log('allids from effect',allids)

    // Only proceed if allIds actually changed (deep comparison)
    const currentIds = allids || [];
    hasChanged = currentIds.length !== previousAllIds.length ||
                      currentIds.some((id, index) => id !== previousAllIds[index]);

    if (hasChanged && currentIds.length > 0) {

      console.log('allIds changed from', previousAllIds, 'to', currentIds);

      fetchDataFromPHP(currentIds).then(()=>{
        //hasChanged=false;
        showTable=true;
        console.log('from fetchDataFromPHP')
        previousAllIds = [...currentIds]; // Update previous state




//get data from fetchDataFromPHP and use it to create the table
const info = tableData;


console.log('showTable in table',showTable)
if (info && info.length > 0 && showTable) {
 console.log('Table: tableData changed, length:', info?.length);
 // Process the remote data here
// console.log('Table: Processing remote data:', info);

 filteredTaxDataObjs = taxDataObjs.filter(obj => allids.includes(obj.id))
 console.log('Table: filteredTaxDataObjs, containing pngp_data', filteredTaxDataObjs);
 let infoMerged=info.map(item=>{
   let tax= sanitizeData(filteredTaxDataObjs).find(obj=>obj.id===item.tax_id);
   let pngp_data=tax?.pngp_data;
   //we have to sanitize!!!
   let s_data=sanitizeData([pngp_data]);

   // Create a new object by merging properties
const merged = {
...tax,                          // Spread all existing properties
...s_data[0],
pngp_data: undefined,
...item
    // Remove the nested pngp_data
};

// Remove the undefined pngp_data property
delete merged.pngp_data;

return merged;

 })
 console.warn('infoMerged',infoMerged);









}
});

let table = $derived.by(()=>{
  setTimeout(()=>{
    /* hasChanged=false; */
  },100)
  console.log('showTable in table',showTable)
  if (showTable)
  return new TableHandler(infoMerged, { rowsPerPage: 100 })
})
//table.createFilter('species_n')
/* ,{
 type: 'text',
 placeholder: 'Search by species name',
 debounce: 300,
 filter: (row, value) => {
   console.log(row,value)
   return row.species_n.toLowerCase().includes(value.toLowerCase());
 }
}) */



    }
  }
  });
  let filteredTaxDataObjs;
  let duplicateTaxDataObjs=$derived.by(()=>{
    let duplIds=$paramsFilter.allIds;

    if (!duplIds || duplIds.length==0)
    return;

    if (taxDataObjs && taxDataObjs.length>0) {
        console.log('Table: duplIds', duplIds);
    //    alert(taxDataObjs.filter(obj => allids.includes(obj.id)).length)
    return taxDataObjs.filter(obj => allids.includes(obj.id))
    }
    else
    {
        return [];
    }

})

     //let table = $derived(new TableHandler(getFilteredSpecies(), { rowsPerPage: 10, selectBy: 'tax_id' }))
   let table = $derived.by(()=>{

     //get data from fetchDataFromPHP and use it to create the table
     const info = tableData;


console.log('showTable in table',showTable)
    if (info && info.length > 0 && showTable) {
      console.log('Table: tableData changed, length:', info?.length);
      // Process the remote data here
     // console.log('Table: Processing remote data:', info);

      filteredTaxDataObjs = taxDataObjs.filter(obj => allids.includes(obj.id))
      console.log('Table: filteredTaxDataObjs, containing pngp_data', filteredTaxDataObjs);
      let infoMerged=info.map(item=>{
        let tax= sanitizeData(filteredTaxDataObjs).find(obj=>obj.id===item.tax_id);
        let pngp_data=tax?.pngp_data;
        //we have to sanitize!!!
        let s_data=sanitizeData([pngp_data]);

        // Create a new object by merging properties
const merged = {
    ...tax,                          // Spread all existing properties
    ...s_data[0],
    pngp_data: undefined,
    ...item
         // Remove the nested pngp_data
};

// Remove the undefined pngp_data property
    delete merged.pngp_data;

return merged;

      })
      console.warn('infoMerged',infoMerged);





    let table = new TableHandler(infoMerged, { rowsPerPage: 100 })


    return table;
    }


    //table.createFilter('species_n')
    /* ,{
      type: 'text',
      placeholder: 'Search by species name',
      debounce: 300,
      filter: (row, value) => {
        console.log(row,value)
        return row.species_n.toLowerCase().includes(value.toLowerCase());
      }
    }) */

  })

  // React to remoteDataStore changes
  $effect(() => {
    const remoteData = $remoteDataStore;
    console.log('Table: remoteDataStore changed in TAble, length:', remoteData.length);

    if (remoteData && remoteData.length > 0) {
      // Process the remote data here
      // console.log('Table: Processing remote data:', remoteData);
    }
  });


  function sanitizeData(rows) {
  const replacement = 'No data';
  const sanitized = new Array(rows.length);

  for (let i = 0; i < rows.length; i++) {
    const row = {};
    const original = rows[i];

    for (const key in original) {
      row[key] = (original[key] === null || original[key] === -1) ? replacement : original[key];
    }

    sanitized[i] = row;
  }

  return sanitized;
}

  // Function to call PHP endpoint
  async function fetchDataFromPHP(ids) {
    try {
      // Build query string for GET request
      const queryParams = new URLSearchParams({
        ids: ids.join(','), // Convert array to comma-separated string
        // Add any other parameters you need
      });

      const response = await fetch(`https://pere.gis-ninja.eu/pngp_phps/getPointsById.php?${queryParams}`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
    //    console.log('PHP response:', data);

        // Process the PHP response
        // You might want to update a store or state with this data
     //   console.warn('sanitizing data',sanitizeData(data))
        tableData=sanitizeData(data);
      } else {
        console.error('PHP call failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error calling PHP:', error);
    }
  }

    // Create table handler with species data

    //getFilteredSpecies provides only random limited data

</script>




<!-- <div class="text-lg">{toPlot}</div> -->
<section class="bg-dasrken">

{#if table}

<aside class="flex">
		<div>
			<h1>Species Database</h1>
			<p>Here's the species observation data</p>
            {#if duplicateTaxDataObjs && duplicateTaxDataObjs.length>0}


    <div class="flex text-lg"> Your filter </div>
 <!--    {#if search}
    <aside class="flex">


        <input type="text" bind:value={search.value} oninput={() => search.set()} placeholder="Filter different fields...">

    </aside>
    {/if} -->
    {duplicateTaxDataObjs.map(obj=>obj.species_n).join(', ')}
    <div>
        {#if $paramsFilter.vArrSel.length>0}
        Valleys:
        {paramsFilter.vArrSel.join(', ')}
        {/if}
        {#if $paramsFilter.yArrSel.length>0}
        Years:
        {paramsFilter.yArrSel.join(', ')}
        {/if}
    </div>

    {/if}
</div>
</aside>


		<!-- <img src="/datatables/external/avatar-shadcn.png" alt="avatar" /> -->




<Datatable {table}>
    {#snippet header()}
    <!-- <Search {table}/> -->

        <Header {table}/>
        <RowsPerPage {table}/>
    {/snippet}
    <table>
        <thead>
            <tr>
            <!--     <th style:width="160px">
                    <div class="flex">
                        <Checkbox
                            onclick={() => table.selectAll()}
                            margin={[0,12,0,0]}
                            size={16}
                            checked={table.isAllSelected}
                        />
                        Tax ID
                    </div>
                </th> -->
                <!-- FIELD MUST BE THE SAME THAT IN THE DATA FIELD -->
                    <Th {table} field="species_n">Scientific Name</Th>
                    <Th {table} field="name_it">Common Name</Th>
                    <Th {table} field="total_ind">Total Individuals</Th>

                <Th {table} field="valley">Valley</Th>
                <Th {table} field="year">Year</Th>
                <Th {table} field="month">Month</Th>
                <Th {table} field="geo">Georeferenced</Th>
                <!-- <Th {table} field="tax_level">Tax Level</Th> -->

            <!--     <Th {table} field="total_ind">Total Individuals</Th> -->
            </tr>
        </thead>
        <tbody>
            {#each  table.rows as row,index}
     <!--        {@const tax=findTaxById(row.id)}
            {@const displayName = (() => {
                const nameIt = tax?.pngp_data?.name_it || tax?.name_it;
                const nameEng = tax?.pngp_data?.name_eng || tax?.name_eng;
                if (nameIt && nameEng) return `${nameIt}/${nameEng}`;
                return nameIt || nameEng || 'No data';
            })()} -->
                <tr class:active={table.selected.includes(row.id)}>
                    <!-- <td>
                        <div class="flex">
                            <Checkbox
                                margin={[0,12,0,0]}
                                size={16}
                                checked={table.selected.includes(row.tax_id)}
                                onclick={() => table.select(row.tax_id)}
                            />
                            {tax?.species_n || tax?.name_it || tax?.name_eng || row.tax_id}
                        </div>
                    </td> -->
                    <td>

                            {row.species_n}


                    </td>
                    <td>

                        {row.name_it}


                </td>
                    <td>

                        {row.total_ind}


                </td>

                    <td class="truncate">
                        <div class="flex">
                            <!-- NOT ACCEPTING THIS!! -->
                            <!-- {row.valley || 'N/A'} -->
                            {row.valley}
                        </div>
                    </td>
                    <td>
                        <div class="flex">{row.year}</div>
                    </td>
                   <!--  <td>
                        <div class="flex">{capitalize(row.tax_level)}</div>
                    </td> -->
                    <td>
                        <div class="flex">{row.month}</div>
                    </td>
                    <td>
                        <div class="flex">{row.georef}</div>
                    </td>
                   <!--  <td>
                        <div class="flex">{row.total_ind}</div>
                    </td> -->
                </tr>
            {/each}
        </tbody>
    </table>
    {#snippet footer()}
        <Footer {table}/>
    {/snippet}
</Datatable>


{:else}

<aside class="flex">
    <section>
        <div class=" text-3xl mt-4">No data</div>
        <div class=" text-xl">Apply filters on the map to see data in form of a table</div>
    </section>
</aside>

{/if}

</section>

<style>


	section {



		/* min-width: 1080px; */

        padding: .5rem;
	}
	aside {
		justify-content: space-between;


        padding: .5rem;
	}
	section h1 {
		font-size: 28px;
		padding: 0;
		font-weight: bold;
		margin: 0;
	}
	p {
		color: var(--font-grey);
		margin: 4px 0;
	}
	img {
		width: 48px;
		height: 48px;
	}
	section :global(footer.container) {
		border-top: none !important;
	}



    table {
        border: 1px solid rgba(114, 113, 113, 0.574);
        border-radius: 2px;
        margin: 8px 0 0 0;
    }
    thead th {
        border-radius: 2px 0 0 0;
    }
    thead :global(th:last-child) {
        border-radius: 0 8px 0 0;
    }
    td :global(svg) {
        margin-right: 6px;
    }

    tbody td {
        border: none !important;
        border-bottom: 1px solid rgba(203, 195, 195, 0.632)!important;
        padding: 10px 20px !important;
    }
    tr:last-child td{
        border: none !important;
    }
    tbody tr:last-child td:first-child{
        border-radius: 0 0 0 8px;
    }
    tbody tr:last-child td:last-child{
        border-radius: 0 0 8px 0;
    }
    .truncate {
        text-overflow: ellipsis;
        font-weight: 500;
        white-space: nowrap;
        max-width: 500px;
        overflow: hidden;
    }
    tr.active {
        background: var(--primary-lighten-1) !important;
    }
    tr.active:hover {
        background: var(--primary-lighten-2);
    }
    th {
        background:inherit;
        margin:0;
        font-size:10px;
        user-select: none;
        border-bottom:1px solid rgba(114, 113, 113, 0.574)!important;
        text-align: center;
    }


</style>

