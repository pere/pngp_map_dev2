<script>
    import { paramsFilter } from '../../stores/new_sidebar_stores';
    let manuallyFilteredItemsSpecies = $derived.by((d)=>{
        return $paramsFilter.manuallyFilteredItemsSpecies;
    })
    let autofilteredItemsSpecies = $derived.by((d)=>{
        return $paramsFilter.autofilteredItemsSpecies;
    })
    $effect(()=>{
        console.warn('manuallyFilteredItemsSpecies',manuallyFilteredItemsSpecies,autofilteredItemsSpecies)
    })


</script>
{#if manuallyFilteredItemsSpecies.length>0}
<div>
    <h1>Filters Legend</h1>
    <p>manuallyFilteredItemsSpecies: {paramsFilter.manuallyFilteredItemsSpecies.length}</p>
    <p>autofilteredItemsSpecies: {paramsFilter.autofilteredItemsSpecies.length}</p>
</div>
{/if}