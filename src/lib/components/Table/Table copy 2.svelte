<script>
    //@ts-nocheck
    //@ts-nocheck
    import { TableHandler, Datatable ,ThSort, ThFilter, Pagination, RowsPerPage, Search}  from '@vincjo/datatables'
    //import {Table_Header} from './Table_Header.svelte'
    import Header                       from './Table_Header.svelte'

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
    onMount(() => {
    //loadSpecies();
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
/*   let toPlot=$derived.by(()=>{
    // Read the store value once at the top
    const allIds = $paramsFilter.allIds;


    console.log('Table: paramsFilter', allIds);

    if (allIds && allIds.length > 0) {
        alert(allIds.length+' from derived')
        return allIds.length == 1 ? allIds[0] : allIds.join(',');
    } else {
        return '';
    }
}) */
         // Create a reactive variable to track paramsFilter
  let paramsFilterValue = $state($paramsFilter);
//let allids=$state($paramsFilter.allIds);
let allids=$derived($paramsFilter.allIds);
  // Update the reactive variable when the store changes
  $effect(() => {
    //paramsFilterValue = $paramsFilter;
  });

  // React to paramsFilter.allIds changes and make PHP call
  $effect(() => {
    if (allids && allids.length>0)
    {
        //don’t put side effects inside $derived. Derived values are meant to be pure computations based on state. Since they might be reevaluated multiple times or not at all, including side effects—like network calls or DOM mutations—can lead to unpredictable behavior
        //use $effect instead!!
      //alert(allids.length+' from effect')
      fetchDataFromPHP(allids);
      //get remote
    }


  });

     //let table = $derived(new TableHandler(getFilteredSpecies(), { rowsPerPage: 10, selectBy: 'tax_id' }))
   let table = $derived.by(()=>{
     //get data from fetchDataFromPHP and use it to create the table
     const info = tableData;
     console.log('Table: tableData changed, length:', info?.length);

    if (info && info.length > 0) {
      // Process the remote data here
      console.log('Table: Processing remote data:', info);
    }
    let table = new TableHandler(info, { rowsPerPage: 80 })
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
    return table;
  })

  // React to remoteDataStore changes
  $effect(() => {
    const remoteData = $remoteDataStore;
    console.log('Table: remoteDataStore changed, length:', remoteData.length);

    if (remoteData && remoteData.length > 0) {
      // Process the remote data here
      // console.log('Table: Processing remote data:', remoteData);
    }
  });

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
        console.log('PHP response:', data);

        // Process the PHP response
        // You might want to update a store or state with this data
        tableData=data;
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
{#if table}
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
                    <Th {table} field="species_n">Scientific Name</Th>
                    <Th {table} field="name_it">Common Name</Th>
                <Th {table} field="valley_name">Valley</Th>
                <Th {table} field="year">Year</Th>
                <Th {table} field="tax_level">Tax Level</Th>
                <Th {table} field="month">Month</Th>
            <!--     <Th {table} field="total_ind">Total Individuals</Th> -->
            </tr>
        </thead>
        <tbody>
            {#each  table.rows as row,index}
            {@const tax=findTaxById(row.tax_id)}
            {@const displayName = (() => {
                const nameIt = tax?.pngp_data?.name_it || tax?.name_it;
                const nameEng = tax?.pngp_data?.name_eng || tax?.name_eng;
                if (nameIt && nameEng) return `${nameIt}/${nameEng}`;
                return nameIt || nameEng || 'No data';
            })()}
                <tr class:active={table.selected.includes(row.tax_id)}>
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

                            {tax.species_n}


                    </td>
                    <td>

                            {tax.pngp_data?.name_it}
                            <!-- {displayName} -->

                    </td>
                    <td class="truncate">
                        <div class="flex">
                            {row.valley_name || 'N/A'}
                        </div>
                    </td>
                    <td>
                        <div class="flex">{row.year}</div>
                    </td>
                    <td>
                        <div class="flex">{capitalize(row.tax_level)}</div>
                    </td>
                    <td>
                        <div class="flex">{row.month}</div>
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
{/if}
<style>
    table {
        border: 1px solid var(--grey);
        border-radius: 8px;
        margin: 16px 0 0 0;
    }
    thead th {
        border-radius: 8px 0 0 0;
    }
    thead :global(th:last-child) {
        border-radius: 0 8px 0 0;
    }
    td :global(svg) {
        margin-right: 6px;
    }

    tbody td {
        border: none !important;
        border-bottom: 1px solid var(--grey-lighten) !important;
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
        font-size:13px;
        user-select: none;
        border-bottom:1px solid var(--grey);
        text-align: left;
    }


</style>

