<script>
    // Snippet for a tax card in a popup
    //@ts-nocheck
</script>

{#snippet PopupTaxCard(tax)}
<div class="w-full flex text-gray-500 text-shadow-gray-800 bg-zinc-200">
    <!-- <div class="{sel_tax?'bg-amber-500':'bg-slate-200'} w-full mx-auto mr-2  rounded-md shadow-md overflow-hidden"> -->
        <div class="w-full mx-auto mr-2  rounded-md shadow-md overflow-hidden">
        <div class="md:flex">
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
                <div class="tracking-wide text-xs text-gray-700" >
                    {tax.species_n}
                </div>
                <span class="block mt-1 text-xs leading-tight font-light" >
                    {tax.pngp_data?.name_it} / {tax.pngp_data?.name_eng || tax.preferred_common_name}
                </span>

              <!--   {#if tax.pngp_data?.obs_count}
                    <p class="mt-2 text-xs text-gray-700">
                        <Badge variant="numTaxRecords">{tax.pngp_data?.obs_count}</Badge> records
                    </p>
                {/if} -->

                <div class="text-gray-500 text-xs" >
                    {#if tax.pngp_data && tax.pngp_data.family_n}
                        {#each ['class_n','order_n','family_n','genus_n'] as item, i}
                            <span class="mt-2 font-light text-gray-500">
                                {tax.pngp_data?.[item]}
                                {#if i < 3}/{/if}
                            </span>
                        {/each}
                    {/if}
                </div>


            </div>
        </div>
</div>
</div>
{/snippet}