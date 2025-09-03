<script>
	//@ts-nocheck
	//@ts-ignore
	import { base } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import FilterIcon from '@lucide/svelte/icons/funnel-plus';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import { Button } from '$lib/components/ui/button/index.js';
	import sp_year_stats from '$data/sp_year_stats.json';
	import sp_valley_stats from '$data/sp_valley_stats.json';
	import sp_valley_names from '$data/valley_names.json';
	import sp_year_valley_counts from '$data/sp_year_valley_counts.json';
	import { runeStore } from '$lib/stores/svelte5_stores/RunesStore.svelte.js';
	import {
		filteredTaxInputStore,
		remoteDataStore,
		fetchRemoteData,
		selGrid,
		paramsFilter,
		manuallyFilteredItemsSpecies,
	} from '$lib/stores/new_sidebar_stores.js';
	import * as Menubar from '$lib/components/ui/menubar/index.js';
	import { untrack } from 'svelte';
	import YearValleyFiltersTest from '../TaxFilters/YearValleyFiltersTest.svelte';
	import FiltersTableFilteredInfo from '../TaxFilters/FiltersTableFilteredInfo.svelte';
	import SpeciesCard from './SpeciesCard.svelte';
	/* import SelectLayers_old from "../MapComponents/SelectLayers_old.svelte"; */
	import SelectLayers from '../MapComponents/SelectLayers.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { getBasicRemoteDataStats } from '$lib/stores/BasicRemoteDataStats.svelte.js';

	let firstRender = $state(true);

	$effect(() => {
		// $inspect.trace must be the first statement of a function body
		$inspect.trace();
	});
	$effect(() => {
		if ($paramsFilter.allIds.length > 0) {
			firstRender = false;
		}
	});

	let showToolBar = $state(true);
	let searchSpeciesTerm = $state('');
	let selectedValleys = $state(new Set());
	let valleysArray = $state([]);
	function toggleValley(valleyItem) {
		selectedValleys.has(valleyItem)
			? selectedValleys.delete(valleyItem)
			: selectedValleys.add(valleyItem);
		console.log('selectedValleys', selectedValleys);
		console.log('valleysArray', Array.from(selectedValleys));
		valleysArray = Array.from(selectedValleys);
	}
	$inspect(valleysArray);
	let selectedYears = $state(new Set());
	let yearsArray = $state([]);
	let yArrSel = $state([]);
	let vArrSel = $state([]);
	/* let paramsFilter=$derived.by((d)=>{
      return {
        selIds:selIds,
        yArrSel:yArrSel,
        vArrSel:vArrSel,
        yArr:yArr,
        vArr:vArr
      }
    }) */
	function toggle(yearItem) {
		console.log('toggle', yearItem);
		selectedYears.has(yearItem)
			? selectedYears.delete(yearItem)
			: selectedYears.add(yearItem);
		console.log('selectedYears', selectedYears);
		console.log('yearsArray', Array.from(selectedYears));
		yArrSel = Array.from(selectedYears);
	}

	let yArr = $derived.by((d) => {
		return yearsArray.map((item) => item);
	});
	let vArr = $derived.by((d) => {
		return valleysArray.map((item) => item.valley_id);
	});

	$effect(() => {
		//run the effect only if yArrSel or vArrSel changes
		if ($paramsFilter.yArrSel.length > 0 || $paramsFilter.vArrSel.length > 0) {
			console.log('yArrSel or vArrSel changed', $paramsFilter);
		}
	});
	/*   let yearsArray = $derived.by((d)=>{
      console.log('selectedYears!!!',selectedYears);
      console.log('yearsArray',Array.from(selectedYears));
        return Array.from(selectedYears)
    }) */

	function getYearlyCounts(data) {
		const yearMap = new Map();

		data.forEach((item) => {
			item.data.forEach((entry) => {
				if (entry.year !== null) {
					const current = yearMap.get(entry.year) || 0;
					yearMap.set(entry.year, current + entry.count);
				}
			});
		});

		const result = Array.from(yearMap.entries()).map(([year, count]) => ({
			year,
			count,
		}));
		return result.sort((a, b) => b.count - a.count);
	}

	function getValleyCounts(data) {
		const valleyMap = new Map();

		data.forEach((item) => {
			item.data.forEach((entry) => {
				const current = valleyMap.get(entry.valley_id) || 0;
				valleyMap.set(entry.valley_id, current + entry.count);
			});
		});

		const result = Array.from(valleyMap.entries()).map(
			([valley_id, count]) => ({ valley_id, count })
		);
		result.map((item) => {
			item.valley_name = sp_valley_names.find(
				(valley) => valley.id === item.valley_id
			)?.name;
		});
		return result.sort((a, b) => a.valley_id - b.valley_id);
	}
	// Usage:
	const yearlyCounts = getYearlyCounts(sp_year_stats);
	console.log(yearlyCounts);
	console.log('yearlyCounts', yearlyCounts);
	const valleyCounts = getValleyCounts(sp_valley_stats);
	console.log(valleyCounts);
	console.log('valleyCounts', valleyCounts);

	let tax_data_joined = $state([]);
	let updateMapOnSelection = $state(false);
	let defaultGrid = $state(true);
	let defaultGridValue = $state('pngp_grid_1km_topo');
	//if defaultGrid is true, selGrid is pngp_grid, otherwise it is pngp_grid_140m



	$effect(()=>{
		console.log('defaultGridValue', defaultGridValue);

			$selGrid=defaultGridValue;
			console.log('selGrid value changed to', defaultGridValue);
			debounceTimeout();

	})


	let debounceTimeoutId = null;

	let debounceTimeout = function () {
		clearTimeout(debounceTimeoutId);
		debounceTimeoutId = setTimeout(() => {
			debouncedSearchTerm = searchSpeciesTerm;
			console.log('debouncedSearchTerm', debouncedSearchTerm);

			if ($paramsFilter.updateMapOnSelection) {
				console.warn('selIds in timeout', selIds);
			}
			console.warn('selGrid', selGrid);
			console.warn('paramsFilter in timeout', $paramsFilter);
			//execute fetchRemoteData, wait for it to finish and then console the result
			if (
				$paramsFilter.updateMapOnSelection &&
				filteredItemsSpecies.length > 0
			) {
				console.log('🔍 CALLING fetchRemoteData from debounceTimeout on updateMapOnSelection being true');
				console.trace();

				runeStore.fetchRemoteData(selIds, selGrid, computedParams).then(()=>{
                  console.log('runeStore remoteDataStore pol_ids counts',runeStore.remoteData);
                });

              /*   runeStore.fetchRemoteData(selIds, selGrid, computedParams).then(()=>{
                  console.log('runeStore remoteDataStore pol_ids counts',runeStore.remoteData);
                });
 */

                fetchRemoteData(selIds, selGrid, computedParams).then(()=>{
                    console.log('remoteDataStore pol_ids counts',$remoteDataStore);
                });


			} else {
				//if (plottingCheckedItems && !updateMapOnSelectionChanged)
				if (!$paramsFilter.updateMapOnSelection) {
					let temp_selIds = $paramsFilter.manuallyFilteredItemsSpecies.map(
						(item) => item.tax_id
					);
					console.log(
						'temp_selIds',
						temp_selIds,
						'$paramsFilter.plottingCheckedItems',
						$paramsFilter.plottingCheckedItems
					);
					if (
						temp_selIds.length > 0 &&
						$paramsFilter.plottingCheckedItems === true
					) {
						console.log('🔍 CALLING runeStore fetchRemoteData from debounceTimeout on updateMapOnSelection being true');

						 runeStore.fetchRemoteData(selIds, selGrid, computedParams).then(()=>{
                  		console.log('runeStore remoteDataStore pol_ids counts',runeStore.remoteData);
                	});

						fetchRemoteData(temp_selIds, selGrid, computedParams).then(() => {
							$paramsFilter.plottingCheckedItems = false;
							console.log(
								'remoteDataStore pol_ids counts not updateMapOnSelection',
								$remoteDataStore
							);
						});
					}
					console.log(
						'paramsFilter.updateMapOnSelection is false, FETCHING ONLY SELECTED MANUALLY FILTERED ITEMS'
					);
				}
			}
			let basicRemoteDataStats = getBasicRemoteDataStats();
			//console.log('basicRemoteDataStats', basicRemoteDataStats);
			if (filteredItemsSpecies.length > 0) {
				if ($paramsFilter.updateMapOnSelection) {
					filteredTaxInputStore.set(filteredItemsSpecies);
				} else {
					console.log(
						'paramsFilter.updateMapOnSelection is false, not updating filteredTaxInputStore'
					);
				}
			} else {
				filteredTaxInputStore.set([]);
			}
		}, 700);
	};
	let debouncedSearchTerm = $state('');
	let updateMapOnSelectionChanged = $state(false);
	let plottingCheckedItems = $state(false);
	$effect(() => {
		//fetchRemoteData();
		//   console.log('remoteDataStore',remoteDataStore);
		/* console.log(searchSpeciesTerm)
        console.log('searchSpeciesTerm',filteredItemsSpecies) */

		if (searchSpeciesTerm !== debouncedSearchTerm) {
			console.log(
				'searchSpeciesTerm !== debouncedSearchTerm',
				searchSpeciesTerm,
				debouncedSearchTerm
			);
			console.log(
				'whithout this we do not get the filtered by keywordlist of species'
			);
			//without this it does not symbolize the species on the map either
			debounceTimeout();
		}

		//if (plottingCheckedItems && !updateMapOnSelectionChanged)
		if (
			!$paramsFilter.updateMapOnSelection &&
			$paramsFilter.plottingCheckedItems
		) {
			console.log('paramsFilter', $paramsFilter.manuallyFilteredItemsSpecies);
			console.log('plottingCheckedItems', $paramsFilter.plottingCheckedItems);

			/* updateMapOnSelectionChanged=true;
          updateMapOnSelection=true; */
			//updateMapOnSelection=false;
			debounceTimeout();
		}
	});

	$effect(async () => {
		try {
			// Load tax_data_joined_new.json
			//static/data/   !!!! but on production it is /data/tax_data_joined_new.json

			const response = await fetch(`/data/new_sources/tax_data_joined_new_geo.json`);


			if (response.ok) {
				const data = await response.json();
				tax_data_joined = data;


				console.log('Loaded tax_data_joined:', data.length, 'records');
			}
		} catch (e) {
			alert('NOT tax_data_joined_new.json loaded');
			console.error('Failed to load tax_data_joined_new.json:', e);
		}
	});

	/*   let manuallyFilteredItemsSpecies = $derived.by((d)=>{
    return tax_data_joined.filter(d=>d.pngp_data)
  }) */
	let manuallyFilteredItemsSpecies2 = $derived.by(() => {
		let t =
			$paramsFilter?.manuallyFilteredItemsSpecies &&
			$paramsFilter?.manuallyFilteredItemsSpecies.length > 0;
		if (t) {
			console.log('manuallyFilteredItemsSpecies2', $paramsFilter);
			return $paramsFilter.manuallyFilteredItemsSpecies;
		} else {
			return [];
		}
	});

	let filteredItemsSpecies = $derived.by((d) => {
		//being searchSpeciesTerm reactive
		let term = debouncedSearchTerm.toLowerCase();
		if (term.length == 0) return [];
		//if (!updateMapOnSelection) return [];

		let f = tax_data_joined.filter(
			(tax) =>
				tax.species_n.toLowerCase().includes(term) ||
				tax.pngp_data?.name_it?.toLowerCase().includes(term) ||
				tax.pngp_data?.name_eng?.toLowerCase().includes(term) ||
				tax.pngp_data?.genus_n.toLowerCase().includes(term) ||
				tax.pngp_data?.family_n.toLowerCase().includes(term) ||
				tax.pngp_data?.order_n.toLowerCase().includes(term) ||
				tax.pngp_data?.class_n.toLowerCase().includes(term) ||
				tax.preferred_common_name?.toLowerCase().includes(term)
		);

		if (orderBy !== 'species_n') {
			f = f.filter((d) => d.pngp_data);
		}
		let sorted = f.sort((a, b) => {
			if (orderBy === 'species_n')
				return a.species_n.localeCompare(b.species_n);
			if (orderBy === 'name_it')
				return a.pngp_data.name_it.localeCompare(b.pngp_data.name_it);
			if (orderBy === 'name_eng')
				return a.pngp_data.name_eng.localeCompare(b.pngp_data.name_eng);
			if (orderBy === 'genus_n')
				return a.pngp_data.genus_n.localeCompare(b.pngp_data.genus_n);
			if (orderBy === 'family_n')
				return a.pngp_data.family_n.localeCompare(b.pngp_data.family_n);
			if (orderBy === 'counts') {
				return b.pngp_data.obs_count - a.pngp_data.obs_count;
			}
		});

		return sorted;
	});
	$inspect(filteredItemsSpecies);
	let selIds = $derived.by((d) => {
		if (!$paramsFilter.updateMapOnSelection) {
			return $paramsFilter.manuallyFilteredItemsSpecies.map((item) => item.tax_id);
		} else {
			/* if ($paramsFilter?.manuallyFilteredItemsSpecies.length==0)
    return */

			let filteredIds = filteredItemsSpecies.map((item) => item.tax_id);
			//if manuallyFilteredItemsSpecies.length>0, return manuallyFilteredItemsSpecies.map((item)=>item.id)
			const manuallyFiltered = $paramsFilter?.manuallyFilteredItemsSpecies;

			console.log('manuallyFiltered', manuallyFiltered);
			//Array.isArray($manuallyFilteredItemsSpecies) ? $manuallyFilteredItemsSpecies : [];
			if (manuallyFiltered.length > 0) {
				//merge manuallyFilteredItemsSpecies with filteredItemsSpecies
				let f = manuallyFiltered.filter(
					(item) => !filteredIds.includes(item.tax_id)
				);
				if (f.length > 0) {
					filteredItemsSpecies.push(...f);
				}

				return filteredItemsSpecies.map((item) => item.tax_id);
			} else {
				return filteredItemsSpecies.map((item) => item.tax_id);
			}
		}
	});

	let filtersActive = $state(true);
	// Simple derived values - no complex store synchronization needed
	let computedParams = $derived({
		filtersActive: filtersActive,
		selIds: selIds,
		yArrSel: Array.from(yArrSel),
		vArrSel: Array.from(vArrSel),
		yArr: yArr,
		vArr: vArr,
		manuallyFilteredItemsSpecies:
			$paramsFilter?.manuallyFilteredItemsSpecies || [],
	});

	$inspect(paramsFilter).with((type) => {
		let raw = $state.snapshot(paramsFilter);
		console.log('paramsFilter inspected', raw);
		/* 	if (type === 'update') {
      debugger;

		} */
	});

	//$inspect(fReducedYearsArr);
	let orderBy = $state('species_n');

	let searchFields = $state({
		scientific: true,

		common: false,
		italian: false,
		english: false,
	});

	let searchFieldsArray = $state([
		{ type: 'scientific', checked: true },
		{ type: 'common', checked: true },
		{ type: 'italian', checked: false },
		{ type: 'english', checked: true },
	]);

	// Selection highlighting is driven by $paramsFilter.manuallyFilteredItemsSpecies
	// No local selection state is needed

	// Reorder displayed items so that selected species (from $paramsFilter.manuallyFilteredItemsSpecies)
	// are kept on top while preserving relative order within groups
	let displayList = $derived.by(() => {
		const list =
			searchSpeciesTerm.length > 0 ? filteredItemsSpecies : tax_data_joined;

		if (!Array.isArray(list) || list.length === 0) return [];
		const selSet = new Set(
			($paramsFilter?.manuallyFilteredItemsSpecies || []).map((it) => it.tax_id)
		);
		const selected = [];
		const others = [];

		for (const item of list) {
			(selSet.has(item.tax_id) ? selected : others).push(item);
		}

		let sortedOthers = others
			.filter((d) => d.pngp_data?.obs_count)
			.sort((a, b) => {
				if (orderBy === 'obs_count')
					return b.pngp_data.obs_count - a.pngp_data.obs_count;
				if (orderBy === 'species_n')
					return a.species_n.localeCompare(b.species_n);
				if (orderBy === 'name_it')
					return a.pngp_data.name_it.localeCompare(b.pngp_data.name_it);
				if (orderBy === 'name_eng')
					return a.pngp_data.name_eng.localeCompare(b.pngp_data.name_eng);
				if (orderBy === 'genus_n')
					return a.pngp_data.genus_n.localeCompare(b.pngp_data.genus_n);
				if (orderBy === 'family_n')
					return a.pngp_data.family_n.localeCompare(b.pngp_data.family_n);
				if (orderBy === 'order_n')
					return a.pngp_data.order_n.localeCompare(b.pngp_data.order_n);
				if (orderBy === 'class_n')
					return a.pngp_data.class_n.localeCompare(b.pngp_data.class_n);
				if (orderBy === 'preferred_common_name')
					return a.preferred_common_name.localeCompare(b.preferred_common_name);
				return 0;
				//a.species_n.localeCompare(b.species_n);
			});

		let all = [...selected, ...sortedOthers];
		return all;
	});

	$effect(() => {
		//not working
		console.log('searchFields', searchFieldsArray);
	});

	// Debug effect for manuallyFilteredItemsSpecies2
	$effect(() => {
		console.log('changed to ' + showToolBar);

		//console.log('🔥 manuallyFilteredItemsSpecies2 changed:', manuallyFilteredItemsSpecies2.length, manuallyFilteredItemsSpecies2);
	});
	let filterIconClicked = $state(false);

	let filterIconClick = () => {
		console.log('filter icon clicked');
	};

	function showTaxToast(tax) {
		toast('Tax added', {
			titleClass: 'text-lg',
			// description: tax.species_n+' is being added to the map...',
			description: 'New species are added to the map',
			class: 'bg-amber-50 border border-amber-300 text-amber-950',
			descriptionClass: 'text-amber-800',
			/*  action: {
        label: 'View usage',
        onClick: () => console.log('view usage')
      } */
		});
	}
	$effect(() => {
		console.log('firstRender bein in taxsearchspecies', firstRender);
	});
</script>

<Tabs.Root class="gap-0" value="species">
	<Tabs.List>
		<Tabs.Trigger value="species">Species</Tabs.Trigger>
		<Tabs.Trigger value="layers">Layers</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content
		class="max-h-[calc(100vh-20px)] overflow-y-auto"
		value="species"
	>
		<Card.Root class="p-0 m-0 bg-sidebar">
			<Card.Header>
				<Card.Description></Card.Description>
			</Card.Header>
			<Card.Content>
				<aside class="flex flex-row items-center space-x-2 p-1 m-0">
					<input
						type="checkbox"
						id="showToolBar-switch"
						bind:checked={showToolBar}
						class="accent-blue-500"
					/>

					<Label class="text-xs ml-1" htmlFor="showToolBar-switch"
						>Show tool bar</Label
					>
				</aside>

				{#if showToolBar}
					<aside
						class="p-1 bl-2 mt-0 border-1 border-gray-300 rounded-md mb-0 text-xs"
					>
						<Menubar.Root>
							<Menubar.Menu>
								<Menubar.Trigger
									class="hidden text-xs bg-zinc-400 text-white cursor-pointer hover:bg-lime-800 hover:text-white"
									>Search by</Menubar.Trigger
								>
								<Menubar.Content class="text-xs">
									<!--   <Menubar.Item  class="text-xs">
          Export CSV <Menubar.Shortcut>⌘E</Menubar.Shortcut>
        </Menubar.Item> -->

									<Menubar.Separator />

									<Menubar.Group class="text-xs">
										<!-- <CheckboxPrimitive.Group name="searchFields">
            <CheckboxPrimitive.Label>Search by</CheckboxPrimitive.Label>
            <CheckboxPrimitive.Root value="scientific" />
            <CheckboxPrimitive.Root value="common" />
            <CheckboxPrimitive.Root value="italian" />
            <CheckboxPrimitive.Root value="english" />
          </CheckboxPrimitive.Group> -->
										<!--  <ul class="list-none p1 m-2 max-h-80 overflow-y-auto">
            {#each searchFieldsArray as field}
                <li class="m-1 pb-0.5">

                    <div class="flex items-left space-x-2">
                        <input
                        type="checkbox"
                        id={field.type}
                        checked={field.checked}

                        onchange={() => toggle(field.type)}
                        class="accent-blue-500"
                        />
                        <label for={field.type}>{field.type}</label>
                        <span>{field.checked}</span>
                    </div>
                </li>

            {/each}
            </ul> -->
										<!--  {#each searchFieldsArray as field}
                  <Menubar.CheckboxItem bind:checked={field.checked} class="text-xs">
                    {field.type === 'scientific' ? 'Scientific Names' : 'Common Names'}
                  </Menubar.CheckboxItem>
                {/each} -->
									</Menubar.Group>

									<!--  <Menubar.Separator />
        <Menubar.Item  class="text-xs">
          Print... <Menubar.Shortcut>⌘P</Menubar.Shortcut>
        </Menubar.Item> -->
								</Menubar.Content>
							</Menubar.Menu>

							<Menubar.Menu>
								<Menubar.Trigger
									class="text-xs bg-zinc-400 text-white cursor-pointer  hover:text-white"
									>Order by</Menubar.Trigger
								>
								<Menubar.Content class="text-xs">
									<Menubar.RadioGroup bind:value={orderBy} class="text-xs">
										<Menubar.RadioItem class="text-xs m-.2" value="species_n"
											>Species name</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="obs_count"
											>Number of records</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="name_it"
											>Italian name</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="name_eng"
											>English name</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="genus_n"
											>Genus</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="family_n"
											>Family</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="order_n"
											>Order name</Menubar.RadioItem
										>
										<Menubar.RadioItem class="text-xs m-.2" value="class_n"
											>Class name</Menubar.RadioItem
										>
										<Menubar.RadioItem
											class="text-xs m-.2"
											value="preferred_common_name"
											>Common Name</Menubar.RadioItem
										>
									</Menubar.RadioGroup>
									<!--  <Menubar.Separator />
        <Menubar.Item inset>Edit...</Menubar.Item>
        <Menubar.Separator />
        <Menubar.Item inset>Add Profile...</Menubar.Item> -->
								</Menubar.Content>
							</Menubar.Menu>

							<Menubar.Menu>
								<Menubar.Trigger
									class="text-xs bg-zinc-400 text-white cursor-pointer hover:text-white"
									>Map</Menubar.Trigger
								>
								<Menubar.Content class="text-xs">
									<Menubar.Group class="text-xs">
										<div class="flex items-center space-x-2 gap- mb-2 mt-1">
											<Switch
												class="accent-blue-500 small-switch"
												on:change={() => {
													//   $paramsFilter.updateMapOnSelection=!$paramsFilter.updateMapOnSelection;
													console.log(
														'paramsFilter.updateMapOnSelection from switch',
														updateMapOnSelection
													);

													//   debounceTimeout();
												}}
												id="map-on-selection-switch"
												bind:checked={$paramsFilter.updateMapOnSelection}
											/>
											<Label class="text-xs" htmlFor="map-on-selection-switch"
												>Update map on selection</Label
											>
										</div>

										<div class="flex items-center space-x-1">
											<Menubar.Content class="text-xs">
												<Menubar.RadioGroup bind:value={defaultGridValue}

												class="text-xs">
													<Menubar.RadioItem class="text-xs m-.2" value="pngp_grid_1km_topo"
														>1km grid</Menubar.RadioItem
													>
													<Menubar.RadioItem class="text-xs m-.2" value="pngp_grid_140m_topo"
														>140 meters grid</Menubar.RadioItem
													>
											</Menubar.RadioGroup>
											</Menubar.Content>

											<!-- <RadioGroup.Root value="1km" class="text-xs"

											onValueChange={()=>handleRadioLayerClick(subItem, i)}>


												<div class="flex items-center space-x-2">
												  <RadioGroup.Item value="1km" id="1km" />
												  <Label for="1km">1km grid</Label>
												</div>
												<div class="flex items-center space-x-2">
												  <RadioGroup.Item value="pol_140m_id" id="140m" />
												  <Label for="140m">140m grid</Label>
												</div>
											  </RadioGroup.Root> -->

											<!-- <Switch
												bind:checked={defaultGrid}
												id="map-on-selection-switch"
											/>
											<Label class="text-xs" htmlFor="map-on-selection-switch"
												>Use default 1km grids</Label
											> -->
										</div>

										<!--    {#each searchFieldsArray as field}
                  <Menubar.CheckboxItem bind:checked={field.checked} class="text-xs">
                    {field.type === 'scientific' ? 'Scientific Names' : 'Common Names'}
                  </Menubar.CheckboxItem>
                {/each} -->
									</Menubar.Group>

									<Menubar.Separator />
								</Menubar.Content>
							</Menubar.Menu>
						</Menubar.Root>
						<!--   <div class="flex items-center space-x-2 gap- mb-2 mt-1">
    <Switch
    class="accent-blue-500 small-switch"
    on:change={()=>{
        console.log('updateMapOnSelection from switch',updateMapOnSelection);

     //   debounceTimeout();
    }}
     id="example-switch" bind:checked={updateMapOnSelection} />
    <Label class="text-xs" htmlFor="example-switch">Update map on selection</Label>
  </div>

  <div class="flex items-center space-x-1">
    <Switch
        bind:checked={defaultGrid}

     id="grid-switch"/>
    <Label class="text-xs" htmlFor="grid-switch">Use default 1km grids</Label>
  </div> -->

						<div class="ml-2 mt-1 flex space-x-1">
							{#if displayList && displayList.length > 0 && !firstRender}
								<FiltersTableFilteredInfo />
							{/if}
							<!-- <YearValleyFiltersTest
{filterIconClicked}
  bind:selectedYears
  bind:selectedValleys
  bind:yArrSel
  bind:vArrSel
  bind:yearsArray
  bind:valleysArray
  {fReduced}
  {fReducedYears}
  {fReducedYearsArr}
  {yearlyCounts}
  {valleyCounts}
  {selIds}
  {filteredItemsSpecies}
  {updateMapOnSelection}
/> -->
							<!-- {fReducedYears?.length} as fReducedYears -->
						</div>
					</aside>
				{/if}

				<div class="m-1 fit-content border-0 border-gray-300 rounded-md">
					<Input
						type="text"
						placeholder="Search by any taxonomic field, common name, etc."
						class="text-xs placeholder:text-xs"
						bind:value={searchSpeciesTerm}
						oninput={() => {
							console.log(
								'filteredTaxInputStore from TaxSearchSpecies',
								$filteredTaxInputStore
							);
							console.log('updateMapOnSelection', updateMapOnSelection);
						}}
					/>
				</div>

				{#if $paramsFilter?.manuallyFilteredItemsSpecies.length > 0}
					<div class="text-xs p-2 border-1 border-gray-300 rounded-md">
						<!-- {$paramsFilter?.manuallyFilteredItemsSpecies.map((item)=>item.id).join(',')} -->

						<div class="flex flex-row gap-2 mt-0 mb-0 items-center">
							<Badge class="text-xs card_selected p-1 h-5 text-white"
								>{$paramsFilter?.manuallyFilteredItemsSpecies.length}</Badge
							>
							species in your list
							<div class="flex flex-row gap-2 items-center ml-2 mt-2">
								<button
									class="text-center text-xs p-1 mb-2 cursor-pointer bg-red-400 text-white hover:bg-red-500"
									onclick={() => {
										$paramsFilter.allIds = [];

										$paramsFilter.manuallyFilteredItemsSpecies = [];
									}}>Clear search</button
								>
								<button
									class="text-center text-xs p-1 mb-2 cursor-pointer bg-teal-600 text-white hover:bg-teal-700"
									onclick={() => {
										console.log(
											'add to map',
											$paramsFilter?.manuallyFilteredItemsSpecies
										);

										//get last one from $paramsFilter?.manuallyFilteredItemsSpeciesfspec
										let lastItem =
											$paramsFilter?.manuallyFilteredItemsSpecies[
												$paramsFilter?.manuallyFilteredItemsSpecies.length - 1
											];
										console.log('lastItem', lastItem);
										//get the name of the last item

										showTaxToast(lastItem);
										//add the last item to the map
										//add the last item to the map
										// toast("<span class='sp_name'>Adding to the maps...</span>"+lastItem.species_n)
										//  plottingCheckedItems=true;
										$paramsFilter.plottingCheckedItems = true;
										$paramsFilter.updateMapOnSelection = false;
										//debounceTimeout();

										//add these $paramsFilter?.manuallyFilteredItemsSpecies
									}}>Map it</button
								>
								<!-- <Button variant="link"  class="cursor-pointer text-xs p-1 m-0 " onclick={()=>{
  $paramsFilter.allIds=[];

  $paramsFilter.manuallyFilteredItemsSpecies=[];
}}>Clear</Button> -->
								<!-- <Button variant="link" class="cursor-pointer text-xs p-.5 pt-.5 pb-.5  m-0 " onclick={()=>{
  console.log('add to map',$paramsFilter?.manuallyFilteredItemsSpecies)

  //get last one from $paramsFilter?.manuallyFilteredItemsSpecies
  let lastItem = $paramsFilter?.manuallyFilteredItemsSpecies[$paramsFilter?.manuallyFilteredItemsSpecies.length-1];
  console.log('lastItem',lastItem)
  //get the name of the last item

  showTaxToast(lastItem)
  //add the last item to the map
  //add the last item to the map
 // toast("<span class='sp_name'>Adding to the maps...</span>"+lastItem.species_n)
  //  plottingCheckedItems=true;
  $paramsFilter.plottingCheckedItems=true;
  $paramsFilter.updateMapOnSelection=false;
  //debounceTimeout();

  //add these $paramsFilter?.manuallyFilteredItemsSpecies
}}>Add to the map</Button> -->
							</div>
						</div>

						<div class="flex space-x-1">
							{#if displayList && displayList.length > 0}
								<div class="w-auto">
									<span class="text-black-500 font-bold m-0">
										{filteredItemsSpecies?.length ||
											tax_data_joined?.length}</span
									>
									species found
									<Separator class="w-full" />
									Click on a species to add/remove from the list
								</div>
							{:else}
								No info found
							{/if}
						</div>
					</div>
				{/if}

				<aside class="tax_container max-h-[calc(100vh-20px)] overflow-y-auto">
					{#each displayList as tax, i (tax.tax_id + '-' + i)}
						<!-- {@const withYear=fReduced.data.find(d=>d.tax_id===tax.id)}

{@const withYearData=withYear?.data.reduce((memo,d)=>{
  if (!memo.find(el=>el.year===d.year))
  memo.push({tax_id:d.tax_id,year:d.year,valley_name:d.valley_name,valley_id:d.valley_id,count:d.count})
  else
  memo.find(el=>el.year===d.year).count+=d.count;
  return memo;
},[])}
 -->
						<div>
							<SpeciesCard
								selected={$paramsFilter?.manuallyFilteredItemsSpecies?.some(
									(item) => item.tax_id === tax.tax_id
								)}
								{tax}
								highlightedText={searchSpeciesTerm}
							/>
						</div>
					{/each}
				</aside>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
	<Tabs.Content class="h-full" value="layers">
		<Card.Root class="m-0 p-0 bg-transparent shadow-none border-none border-0">
			<Card.Header class="bg-transparent border-none">
				<!-- <Card.Description>Select layers to display</Card.Description> -->
			</Card.Header>
			<Card.Content class="m-0 p-0 test">
				<aside class="mb-5 border-0">
					<!--  <SelectLayers_old /> -->
					<SelectLayers />
				</aside>
			</Card.Content>
		</Card.Root>
	</Tabs.Content>
</Tabs.Root>

<style>
	:global(.highlight_this) {
		background-color: #7bc815!important;
		font-weight: bold !important;
		padding: 2px 2px;
	}
</style>
