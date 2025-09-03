<script>
    import {remoteDataStore,filteredTaxInputStore} from '$lib/stores/new_sidebar_stores.js';
    import SpeciesCard from "../TaxSearchComponents/SpeciesCard.svelte";
    console.log('Test.svelte component initialized');

    import { runeStore } from '$lib/stores/svelte5_stores/RunesStore.svelte.js';


    //activeItemStore.set(item);

    // Simple reactive variable to test if component updates
    let storeLength = $derived($remoteDataStore?.length || 0);
    let storeData = $derived($remoteDataStore);

    let filteredData=$derived($filteredTaxInputStore);
    // Make uniques reactive to remoteDataStore changes - simplified version
    let uniques = $derived(
        $remoteDataStore?.length > 0
            ? [...new Set($remoteDataStore.map((d) => d.count))]
            : []
    );

    $effect(() => {
        console.log('filteredData in testss',filteredData)
        console.log('runeStore',runeStore);
        console.log('🔍 Test.svelte store effect - length:', storeLength, 'data:', storeData);
    });

    $effect(() => {
        console.log('🔍 Test.svelte uniques effect:', uniques.length, uniques);
    });
</script>
<!-- <h5>MAP test</h5> -->

<div class="tax_container bg-cyan-800">
   {#each filteredData as tax, i (tax.id + '-' + i)}
     <SpeciesCard {tax} />




    {/each}
</div>

<div>
    <p>Filtered data length: {filteredData.length}</p>
    {#each filteredData as d}
    <div>{d.species_n}</div>
    {/each}
    <p>Store length: {storeLength}</p>
    <p>Uniques count: {uniques.length}</p>
    <div>
        {#each uniques as uniqueValue}
        <div style="background: #eee; margin: 2px; padding: 4px;">{uniqueValue}</div>
        {/each}
    </div>
    {#if uniques.length === 0}
        <p style="color: red;">No unique values found</p>
    {/if}
</div>