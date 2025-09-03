<script>
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import FilterIcon from '@lucide/svelte/icons/funnel-plus';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import sp_year_stats from '/data/sp_year_stats.json';
	import sp_valley_stats from '/data/sp_valley_stats.json';
	import sp_valley_names from '/data/valley_names.json';
	import sp_year_valley_counts from '/data/sp_year_valley_counts.json';
	import {
		filteredTaxInputStore,
		remoteDataStore,
		fetchRemoteData,
		selGrid,
	} from '$lib/stores/new_sidebar_stores.js';

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
	function toggle(yearItem) {
		console.log('toggle', yearItem);
		/* selectedYears.has(yearItem) ? selectedYears.delete(yearItem) : selectedYears.add(yearItem );
        console.log('selectedYears',selectedYears);
        console.log('yearsArray',Array.from(selectedYears));
        yearsArray=Array.from(selectedYears); */
	}

	let yArr = $derived.by((d) => {
		return yearsArray.map((item) => item.year);
	});
	let vArr = $derived.by((d) => {
		return valleysArray.map((item) => item.valley_id);
	});

	$effect(() => {
		let f = sp_year_valley_counts.filter((d) => selIds.includes(d.tax_id));
		console.log('yearsArray new', yearsArray);
		console.log('valleysArray', valleysArray);
		console.log('yArr', yArr);
		console.log('vArr', vArr);
	});

	$effect(() => {
		console.log('selectedValleys', selectedValleys);
		console.log('valleysArray raw:', $state.snapshot(valleysArray));
		console.log('valleysArray length', valleysArray.length);
		// Alternative ways to access the data:
		let s = $state.snapshot(valleysArray);
		console.log('valleysArray via snapshot', s);

		console.log('filteredItemsSpecies', filteredItemsSpecies);

		//return filteredItemsSpecies.map((item)=>item.id);
		console.log('selIds', selIds);

		/*    console.log('valleysArray via for loop:');
      for (let i = 0; i <script valleysArray.length; i++) {
        console.log(i, valleysArray[i]);
      } */
	});

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

	let fReduced = $derived.by(() => {
		console.log(
			'fReduced recalculating - selIds:',
			selIds.length,
			'yArr:',
			yArr.length,
			'vArr:',
			vArr.length
		);

		// Explicitly access all reactive dependencies
		const currentSelIds = selIds;
		const currentYArr = yArr;
		const currentVArr = vArr;

		/*
		"tax_id": 2,
		"data": [
			{ "year": 2013, "valley_name": "Cogne", "valley_id": 1, "count": 28 }, */

		let f = sp_year_valley_counts.filter((d) =>
			currentSelIds.includes(d.tax_id)
		);
		let _reduced = f.reduce((acc, item) => {
			let tax_id = item.tax_id;
			let data = item.data;
			item.data.forEach((d) => {
				if (
					(currentYArr.length === 0 || currentYArr.includes(d.year)) &&
					(currentVArr.length === 0 || currentVArr.includes(d.valley_id)) &&
					!acc.includes(d)
				) {
					if (!acc.find((d) => d.tax_id === tax_id)) {
						acc.push({
							tax_id: tax_id,
							data: [d],
						});
					} else {
						acc.find((d) => d.tax_id === tax_id).data.push(d);
					}
				}
			});
			return acc;
		}, []);
		console.log('fReduced result:', _reduced);

		let totalCount = _reduced.reduce(
			(acc, item) => acc + item.data.reduce((acc, d) => acc + d.count, 0),
			0
		);

		let processedData = {
			data: _reduced,
			total: totalCount,
		};

		console.log('fReduced result:', processedData);
		return processedData;
	});

	//$inspect(fReduced);

	let fReducedYears = $derived.by(() => {
		console.warn('reducing yearsaa');
		let x = fReduced.data.reduce((memo, d) => {
			d.data.forEach((el) => {
				let year = el.year;

				if (!memo.find((d) => d.year === year)) {
					memo.push({
						year: year,
						counts: el.count,
					});
				} else {
					/*              {
    "year": "No data",
    "valley_name": "Cogne",
    "valley_id": 1,
    "count": 24
} */
					memo.find((d) => d.year === year).counts += el.count;
				}
			});
			return memo;
		}, []);
		console.log('x', x);
		console.warn(
			'sorted x',
			x.sort((a, b) => a.counts - b.counts)
		);
		return x.sort((a, b) => b.counts - a.counts);
	});

	let fReducedYearsArr = $derived(fReducedYears.map((d) => d.year));

	$inspect(fReducedYearsArr);
</script>
