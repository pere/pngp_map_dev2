<script>
    //@ts-nocheck
    import { ScrollArea } from "bits-ui";
    import * as Chart from "$lib/components/ui/chart/index.js";
    import { BarChart } from "layerchart";
    import {basicRemoteDataStats, isLoading, error} from '$lib/stores/BasicRemoteDataStats.svelte.js';
    import {get_tax_data_joined_store} from '$lib/stores/test.svelte.js';
    import * as Tabs from '$lib/components/ui/tabs/index.js';

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
             <Chart.Container class="w-full h-80">
                        <BarChart data={d} x="year" y="count">
                    {#snippet tooltip()}
                        <Chart.Tooltip />
                    {/snippet}
                    </BarChart>
                </Chart.Container>




            <!--   <Chart.Container class="w-full h-80">
                        <BarChart data={d} x="year" y="count">
                    {#snippet tooltip()}
                        <Chart.Tooltip />
                    {/snippet}
                    </BarChart>
                </Chart.Container> -->

                    <p>Year stats available: {Object.keys(yearStats).length} years</p>

                    <ScrollArea.Root
  class="p-0 mt-2 border-dark-10 bg-background-alt shadow-card relative overflow-hidden
  rounded-[2px] border px-0 py-0"
>
  <ScrollArea.Viewport class="h-full max-h-[200px] w-full">
    {#if type === 'list'}
    Visualizing as list
    {:else}
    Visualizing as inputs
    {/if}
    <ul class="list-none p1 m-2 max-h-80 overflow-y-auto">
        {#each yearStatsSorted as year}
            <li class="m-1 pb-0.5">
                {year.year} : {year.count} records</li>
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


                    </div>

                {/if}




            </div>

            {#if valleysStats}

        <!--   <Chart.Container class="w-full h-80">
                    <BarChart data={d} x="year" y="count">
                {#snippet tooltip()}
                    <Chart.Tooltip />
                {/snippet}
                </BarChart>
            </Chart.Container> -->

                <p>Valleys stats available: {Object.keys(valleysStats).length} valleys</p>


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
    {:else}
        <!-- <p>No stats available</p> -->
    {/if}
</aside>

<style>
    .error {
        color: red;
    }
</style>