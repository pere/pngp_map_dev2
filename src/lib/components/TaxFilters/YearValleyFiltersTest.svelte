<script>
  //@ts-nocheck
  //@ts-ignore
import * as Card from "$lib/components/ui/card/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { filteredTaxInputStore, remoteDataStore, fetchRemoteData, selGrid, paramsFilter } from "$lib/stores/new_sidebar_stores.js";
  import { untrack } from "svelte";

  // Props passed from parent component
  let {
    filterIconClicked,
    selectedYears,
    selectedValleys,
    yArrSel,
    vArrSel,
    yearsArray,
    valleysArray,
    fReduced,
    fReducedYears,
    fReducedYearsArr,
    yearlyCounts,
    valleyCounts,
    selIds,
    filteredItemsSpecies,
    updateMapOnSelection
  } = $props();

  function toggle(yearItem) {
    console.log('toggle', yearItem);
    selectedYears.has(yearItem) ? selectedYears.delete(yearItem) : selectedYears.add(yearItem);
    console.log('selectedYears', selectedYears);
    console.log('yearsArray', Array.from(selectedYears));
    yArrSel = Array.from(selectedYears);
  }

  function toggleValley(valleyItem) {
    selectedValleys.has(valleyItem) ? selectedValleys.delete(valleyItem) : selectedValleys.add(valleyItem);
    console.log('selectedValleys', selectedValleys);
    console.log('valleysArray', Array.from(selectedValleys));
    valleysArray = Array.from(selectedValleys);
  }

  function applyYearFilter() {
    console.log('apply filter', yArrSel);

      paramsFilter.set({ ...$paramsFilter, filtersActive: true,yArrSel:yArrSel,vArrSel:vArrSel });

    console.log('🔘 CALLING fetchRemoteData from Apply Filter button');
    console.warn($paramsFilter)

    console.trace();
    fetchRemoteData(selIds, selGrid).then(() => {
      console.log('remoteDataStore pol_ids counts', $remoteDataStore);

      if (updateMapOnSelection) {
        filteredTaxInputStore.set(filteredItemsSpecies);
      }
    });
  }
</script>

<div class="{filterIconClicked ? 'flex' : 'hidden'} w-full max-w-sm flex-col gap-6">
  <Tabs.Root value="year">
    <Tabs.List>
      <Tabs.Trigger value="year">Year</Tabs.Trigger>
      <Tabs.Trigger value="valley">Valley</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="year">
      <Card.Root>
        <Card.Header>
          <!-- <Card.Title>Year</Card.Title> -->
          <Card.Description class="text-xs">
            Observations by year

            {#if yearsArray.length > 0}
            {fReduced?.total} filtered: {yearsArray?.map(year => year.year).join(', ')}


            {/if}



            <!-- {totalCount} -->
            <!-- {yearsArray?.map(year => year.year).join(', ')} -->
          </Card.Description>
        </Card.Header>
        <Card.Content class="grid gap-2 max-h-50 overflow-y-auto">
          <Table.Root class="text-xs">

            <Table.Header>
              <Table.Row>
                <Table.Head class="w-[100px]"></Table.Head>
                <Table.Head>Counts</Table.Head>
                {#if fReducedYearsArr?.length > 0}
                  <Table.Head>Filtered</Table.Head>
                {/if}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#if fReducedYearsArr?.length > 0}
                {#each fReducedYearsArr as year, i}
                  {@const vis_data = yearlyCounts?.find(d => d.year === year)}
                  <Table.Row>
                    <Table.Cell class="font-medium">
                      <div class="flex items-left space-x-2">
                        <input
                          type="checkbox"
                          id={year}
                          checked={selectedYears.has(year)}
                          onchange={() => toggle(year)}
                          class="accent-blue-500"
                        />
                        <label for={year}>{year}</label>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {vis_data.count}
                    </Table.Cell>
                    <Table.Cell>
                      {fReducedYears[i].counts}
                    </Table.Cell>
                  </Table.Row>
                {/each}
              {:else}
                {#each yearlyCounts as year}
                  <Table.Row>
                    <Table.Cell class="font-medium">
                      <div class="flex items-left space-x-2">
                        <input
                          type="checkbox"
                          id={year.year}
                          checked={selectedYears.has(year)}
                          onchange={() => toggle(year)}
                          class="accent-blue-500"
                        />
                        <label for={year.year}>{year.year}</label>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {year.count}
                    </Table.Cell>
                  </Table.Row>
                {/each}
              {/if}
            </Table.Body>
          </Table.Root>
        </Card.Content>
        {#if yArrSel.length > 0}
          <Card.Footer>
            <Button
              variant="outline"

              disabled={yArrSel.length == 0}
              class="disabled:opacity-50 disabled:cursor-not-allowed text-xs p-1 ml-0"
              onclick={applyYearFilter}
            >Apply filter</Button>


          </Card.Footer>
        {/if}
      </Card.Root>
    </Tabs.Content>
    <Tabs.Content value="valley">
      <Card.Root>
        <Card.Header>
          <!-- <Card.Title>Valley</Card.Title> -->
          <Card.Description class="text-xs">
            Observations by valley
          </Card.Description>
        </Card.Header>
        <Card.Content class="grid gap-2">
          {fReduced?.total} filtered
          {#each valleyCounts as valley, i (valley.valley_id)}
            <div class="flex items-left space-x-2">
              <input
                type="checkbox"
                id={valley.valley_id}
                checked={selectedValleys.has(valley)}
                onchange={() => toggleValley(valley)}
                class="accent-blue-500"
              />
              <label for={valley.valley_id}>{valley.valley_name} {valley.count}</label>
            </div>
          {/each}
        </Card.Content>
        {#if vArrSel.length > 0}
          <Card.Footer>
            <Button variant="outline">Apply filter</Button>
          </Card.Footer>
        {/if}
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>