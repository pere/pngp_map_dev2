<script>
//@ts-nocheck
//@ts-ignore
import { Badge } from "$lib/components/ui/badge/index.js";
    import { writable, derived, get } from 'svelte/store';
    import {manuallyFilteredItemsSpecies,paramsFilter} from '$lib/stores/new_sidebar_stores.js';
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    let {

        tax,
        withYear = null,
        withYearData = [],
        highlightedText = null,
        selected
    } = $props();

    function highlightText(node) {
		$effect(() => {
			// Reset to original text first
			node.textContent = node.textContent;

			if (highlightedText) {
				console.log('highlightText',highlightedText);
				if (!highlightedText.trim()) return;
				const text = node.textContent || '';
				const regex = new RegExp(
					highlightedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
					'gi'
				);

				node.innerHTML = text.replace(
					regex,
					(match) => `<span class="highlight_this">${match}</span>`
				);
			}
		});
	}

    /* $effect(()=>{
        if (tax)
        console.log('tax in SpeciesCard',tax,'selected being',selected);
    }) */
    function toggleStats(taxId) {
        console.log('Clicked explore for tax ID:', taxId);
        let ul = document.querySelector(`ul._${taxId}_years`);
        console.log('ul', ul);
        if (ul) {
            ul.style.display = ul.style.display === 'block' ? 'none' : 'block';
        }
    }

    let sel=$state();
    function handleClick() {
        console.log('clicked',tax);


     /*    const currentParams = get(paramsFilter);
        let f = currentParams?.manuallyFilteredItemsSpecies || [];

        // Ensure f is always an array
        if (!Array.isArray(f)) {
            f = [];
        }

        if (f.includes(tax)) {
            f = f.filter(d=>d!==tax);
        } else {
            f.push(tax);
        } */

       const manuallyFiltered = $paramsFilter?.manuallyFilteredItemsSpecies.find(d=>d.tax_id===tax.tax_id);
       if (manuallyFiltered)
       {

        $paramsFilter.manuallyFilteredItemsSpecies = $paramsFilter.manuallyFilteredItemsSpecies.filter(d=>d.tax_id!==tax.tax_id);
        sel=false;
       }
       else
       {

        $paramsFilter.manuallyFilteredItemsSpecies=[...$paramsFilter.manuallyFilteredItemsSpecies,tax]
        //.push(tax)
        sel=true;
       }

       console.log('new manuallyFilteredItemsSpecies',$paramsFilter.manuallyFilteredItemsSpecies)


    }

/*     let sel_tax = $derived.by(() => {
        const filtered = $paramsFilter?.manuallyFilteredItemsSpecies;

        if (filtered) {
            const found = filtered.find(d => d.tax_id === tax.tax_id);
            if (found)
            return true;
        else
        return false

        }
        else
        {
            console.log('no array??')
            return false;
        }

    }); */

    // Add effect to debug when sel_tax changes
/*     $effect(() => {
        if (sel_tax)
        console.log('🎯 sel_tax changed for', tax.species_n, ':', sel_tax);
    }); */

    function handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    }
</script>

<div
    class="rounded-button cursor-pointer data-highlighted:bg-muted outline-hidden flex w-full select-none items-left py-1 pl-1 text-sm relative cursor-pointer "
    value={tax.tax_id}
    label={tax.species_n}
    role="button"
    tabindex="0"
    onclick={handleClick}
    onkeydown={handleKeydown}
>

    <div class="w-full flex text-white text-shadow-gray-500">
        <!-- <div class="{sel_tax?'bg-amber-500':'bg-slate-200'} w-full mx-auto mr-2  rounded-md shadow-md overflow-hidden"> -->
            <div class="w-full mx-auto mr-2  rounded-md shadow-md overflow-hidden">
            <div class="md:flex  bg-gray-400 hover:bg-lime-700 {selected ? 'card_selected' : 'bg-blue-500'}">
                {#if tax.medium_url}
                    <div class="md:shrink-0">
                        <img
                            class="h-15 w-full object-cover md:h-full md:w-15"
                            src={tax.medium_url}
                            alt={tax.species_n}
                        >
                    </div>
                {:else}
                    <div class="md:shrink-0">
                        <img
                            class="h-15 w-full object-cover md:h-full md:w-15"
                            src="https://blocks.astratic.com/img/general-img-square.png"
                            alt=""
                        >
                    </div>
                {/if}

                <div class="p-2">
                    <div class="tracking-wide text-xs text-black" use:highlightText>
                        {tax.species_n}
                    </div>
                    <span class="block mt-1 text-xs leading-tight font-light" use:highlightText>
                        {tax.pngp_data?.name_it} / {tax.pngp_data?.name_eng || tax.preferred_common_name}
                    </span>

                    {#if tax.pngp_data?.obs_count}
                        <p class="mt-2 text-xs text-gray-700">
                            <Badge variant="numTaxRecords">{tax.pngp_data?.obs_count.toLocaleString()}</Badge> records
                        </p>
                    {/if}
                    {#if tax.pngp_data && tax.pngp_data.family_n}
                    <div class="text-white text-xs" use:highlightText>

                            {#each ['class_n','order_n','family_n'] as item, i}
                                <span class="mt-2 font-light  text-xs">{tax.pngp_data?.[item]}
                                    {#if i < 2} /
                                    {/if}
                                </span>
                            {/each}

                    </div>
                    {/if}
                    {#if tax.wikipedia_url}
                        <div class="mt-2 text-xs text-gray-700 flex flex-row gap-2 text-white underline">
                            <a href={tax.wikipedia_url} target="_blank" class="">Wikipedia</a>
                            {#if tax.inaturalist_id}
                            <a href={`https://www.inaturalist.org/taxa/${tax.inaturalist_id}`} target="_blank" class="">iNaturalist</a>
                            {/if}
                        </div>
                    {/if}


                   <!--  {#if withYear}
                        <div class="text-gray-500 text-xs">
                            <button
                                class="text-blue-600 px-2 py-1 text-[0.7rem] rounded shadow cursor-pointer"
                                onclick={() => toggleStats(tax.id)}
                            >
                                Stats
                            </button>
                        </div>
                    {/if} -->
                </div>
            </div>
        </div>

       <!--  {#if withYear}
            <div class="text-gray-500 text-xs">
                <ul class="_{tax.id}_years" style="display:none">
                    {withYear.data.length} years
                    {#each withYearData as d, i}
                        <li>{d.year} {d.count}</li>
                    {/each}
                </ul>
            </div>
        {/if} -->
    </div>
</div>

<style>
:global(.card_selected) {
    background: oklch(67.146% 0.18255 248.564);
  }
</style>