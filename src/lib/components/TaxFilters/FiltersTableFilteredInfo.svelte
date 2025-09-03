<script>
    //@ts-nocheck
    import FilterIcon from "@lucide/svelte/icons/funnel-plus";
    import { ScrollArea } from "bits-ui";
    import * as Table from "$lib/components/ui/table/index.js";
    import {basicRemoteDataStats, isLoading, error} from '$lib/stores/BasicRemoteDataStats.svelte.js';
    import {get_tax_data_joined_store} from '$lib/stores/test.svelte.js';


    let filterYearIconClicked=$state(false);

let filterYearIconClick=()=>{
    filterYearIconClicked=!filterYearIconClicked;
  console.log('filter icon clicked');
}
let filterIconClickedValleys=$state(false);
let filterIconClickValleys=()=>{
    filterIconClickedValleys=!filterIconClickedValleys;
  console.log('filter icon clicked');
}
    let {type} = $props();
    // Make stats reactive by calling the getter function
    let stats = $derived(basicRemoteDataStats()[0]);
    let loading = $derived(isLoading());
    let errorMsg = $derived(error());

    // Fix the derived - now it will be reactive to changes in stats
    let yearStats = $derived(stats && stats.by_year ? [...stats.by_year].filter(item => item.year) : null)

    // ❌ This mutates the original array, which is forbidden in $derived
/* let yearStatsSorted = $derived(yearStats ? yearStats.sort((a, b) => a.count - b.count) : null); */
    let yearStatsSorted = $derived(yearStats ? [...yearStats].sort((a, b) => b.count - a.count) : null);

    let selectedYears = $state([]);



    function toggle(yearItem) {
    console.log('toggle', yearItem);
    selectedYears.find(item => item.year === yearItem) ? selectedYears.splice(selectedYears.indexOf(item), 1) : selectedYears.push(item);
    /* selectedYears.has(yearItem) ? selectedYears.delete(yearItem) : selectedYears.add(yearItem); */
    console.log('selectedYears', selectedYears);
    console.log('yearsArray', Array.from(selectedYears));

  }

    let valleysStats = $derived(stats && stats.by_valley ? stats.by_valley : null);
    let valleysStatsSorted = $derived(valleysStats ? [...valleysStats].sort((a, b) => b.count - a.count) : null);
    //let d=$derived($state.snapshot(yearStatsSorted))

    $effect(() => {
        console.log('basicRemoteDataStats from sidebar table filtered info', stats);
        console.log('yearStatsSorted:',
        $state.snapshot(yearStatsSorted));
        /* console.log('snapshot by d:', d); */
        console.log('yearStats:', yearStats);

        console.log('get_tax_data_joined_store', get_tax_data_joined_store());
    });
</script>



<aside class="">
    {#if loading}
        <p>Loading stats...</p>
    {:else if errorMsg}
        <p class="error">Error: {errorMsg}</p>
    {:else if stats}
        <div>

                {#if yearStats}
                <div>
            <!--   <Chart.Container class="w-full h-80">
                        <BarChart data={d} x="year" y="count">
                    {#snippet tooltip()}
                        <Chart.Tooltip />
                    {/snippet}
                    </BarChart>
                </Chart.Container> -->




            <!--   <Chart.Container class="w-full h-80">
                        <BarChart data={d} x="year" y="count">
                    {#snippet tooltip()}
                        <Chart.Tooltip />
                    {/snippet}
                    </BarChart>
                </Chart.Container> -->

                    <div class="m-2 flex flex-row">
                        <div class="text-xs">Year stats available: {Object.keys(yearStats).length} years</div>
                        <div>
                            <span class="w-auto text-right cursor-pointer bg:hover(bg-orange-300)">

                                <FilterIcon class="hover:stroke-fuchsia-400 stroke-2 w-3 h-3 text-black-500"
                                 onclick={filterYearIconClick}/>
                                </span>
                        </div>
                    </div>
                        {#if filterYearIconClicked }
                                            <ScrollArea.Root
                        class="p-0 mt-2 border-dark-10 bg-background-alt shadow-card relative overflow-hidden
                        rounded-[2px] border px-0 py-0"
                        >
                        <ScrollArea.Viewport class="h-full max-h-[200px] w-full">

                            <ul class="list-none p1 m-2 max-h-80 overflow-y-auto">
                                {#each yearStatsSorted as year}
                                    <li class="m-1 pb-0.5">

                                        <div class="flex items-left space-x-2">
                                            <input
                                            type="checkbox"
                                            id={year.year}
                                            checked={selectedYears.find(item => item.year === year.year) ? true : false}

                                            onchange={() => toggle(year.year)}
                                            class="accent-blue-500"
                                            />
                                            <label for={year.year}>{year.year}</label>
                                            <span>{year.count}</span>
                                        </div>
                                    </li>

                                {/each}
                                </ul>

                            </ScrollArea.Viewport>
                            <ScrollArea.Scrollbar
                            orientation="vertical"
                            class="bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all duration-200 hover:w-3"
                        >
                            <ScrollArea.Thumb class="bg-muted-foreground flex-1 rounded-full" />
                        </ScrollArea.Scrollbar>
                            </ScrollArea.Root>
                        {/if}

                    </div>

                {/if}




            </div>

            {#if valleysStats }

        <!--   <Chart.Container class="w-full h-80">
                    <BarChart data={d} x="year" y="count">
                {#snippet tooltip()}
                    <Chart.Tooltip />
                {/snippet}
                </BarChart>
            </Chart.Container> -->

                <div class="m-2 flex flex-row">
                        <div class="text-xs">Valleys stats available: {Object.keys(valleysStats).length} valleys</div>
                        <div>
                            <span class="w-auto text-right cursor-pointer bg:hover(bg-orange-300)">

                                <FilterIcon class="hover:stroke-fuchsia-400 stroke-2 w-3 h-3 text-black-500"
                                 onclick={filterIconClickValleys}/>
                                </span>
                        </div>
                    </div>
                    {#if filterIconClickedValleys}

                <ScrollArea.Root
                class="p-0 mt-2 border-dark-10 bg-background-alt shadow-card relative overflow-hidden
                rounded-[2px] border px-0 py-0"
              >
                <ScrollArea.Viewport class="h-full max-h-[200px] w-full">
                  <ul class="list-none p1 m-2 max-h-80 overflow-y-auto">
                      {#each valleysStatsSorted as valley}
                          <li class="m-1 pb-0.5">{valley.valley} : {valley.count} records</li>
                      {/each}
                      </ul>

                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar
                  orientation="vertical"
                  class="bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all duration-200 hover:w-3"
                >
                  <ScrollArea.Thumb class="bg-muted-foreground flex-1 rounded-full" />
                </ScrollArea.Scrollbar>
                  </ScrollArea.Root>
{/if}
            {/if}
    {:else}

    {/if}
</aside>

<style>
    .error {
        color: red;
    }
</style>