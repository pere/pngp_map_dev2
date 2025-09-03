<script>
	//@ts-nocheck
	import { Button } from '$lib/components/ui/button/index.js';
	import chroma from 'chroma-js';
	import { remoteDataStore } from '../../stores/new_sidebar_stores.js';
	import { get } from 'svelte/store';
	import * as ss from 'simple-statistics';
	/* https://simple-statistics.github.io/docs/#jenks */
	// Export jetBreaks and hexColors so parent components can access them
	let { jetBreaksExport = $bindable() } = $props();

	//export jetBreaks so that mainmap.svelte can get the value

	let breaksCount = $state(4);

	let colorScale = $derived.by((d) => {
		console.log('breaksCount in colorScale', breaksCount);
		console.warn('array', Array.from({ length: breaksCount }));
		if (breaksCount)
			//return chroma.scale(['#fafa6e', '#2A4858'])
			//https://oklch.com/
			return chroma
				//.scale(['#e5e4e4', '#ffe64d', '#b02c44', '#ff2f76'])
				.scale(['#f2f593', '#f0aa07', '#f57514', '#f01b0c'])
				.mode('lch')
				.colors(breaksCount);
		else return [];
	});

	//map colorscale to hex colors
	let hexColors = $derived.by((d) => {
		if (!$remoteDataStore || $remoteDataStore.length === 0) return [];
		let uniques = [...new Set($remoteDataStore.map((d) => d.count))];
		return Array.from({ length: breaksCount }).map((d, i) => {
			return colorScale[i];
			//d3.color(colorScale(d)).hex();
		});
	});
	$effect(() => {
		if (jetBreaksLegend)
			console.log('jetBreaksLegend in effect', jetBreaksLegend);
		console.log('colorScale in effect', colorScale);
	});

	//breaks derived value should be reactive to $remoteDataStore changes, but it's currently defined outside the effect. This means it's not updating when new search results come in.

	let JetBreaks = $derived.by(() => {
		if (!$remoteDataStore || $remoteDataStore.length === 0) return [];
		if (breaksCount > 0) {
			let calc = ss.jenks(
				[...new Set($remoteDataStore.map((d) => d.count))].sort(
					(a, b) => a - b
				),
				breaksCount
			);
			console.log(breaksCount, calc, 'calc', [...new Set(calc)]);
			if (!calc || calc.length === 0) return [];
			return [...new Set(calc)];
		}
	});

	let jetBreaksLegend = $derived.by(() => {
		/*
  ["get", "pop_density"], // numeric property in your data
      "#f2f0f7",  // output1: for values < 100
      100, "#cbc9e2", // output2: for 100 ≤ value < 500 */
		if (JetBreaks && JetBreaks.length > 0) {
			console.log('JetBreaks in jetBreaksLegend', JetBreaks);
			let sliced = JetBreaks.slice(1);
			console.log('sliced', sliced);
			return [...sliced].map((d, i) => {
				let label;
				console.log(d, i);
				switch (i) {
					case 0:
						label = `<=${d}`;
						break;
					case sliced.length - 1:
						label = `>= ${sliced[i - 1]}`;
						break;
					default:
						label = `> ${sliced[i - 1]} and <= ${d}`;
						break;
				}
				return {
					count: d,
					color: hexColors[i],
					label: label,
				};
			});
		}
	});

	// Export the jetBreaks data to parent component
	$effect(() => {
		if (jetBreaksLegend && jetBreaksLegend.length > 0) {
			jetBreaksExport = {
				breaks: JetBreaks,
				legend: jetBreaksLegend,
				colors: hexColors,
			};
		}
	});

	let removeBreak = () => {
		console.log('removeBreak');
		breaksCount = breaksCount - 1;
		let b = breaksCount - 1;
		console.log('breaksCount in removeBreak', b);
		let calc2 = ss.jenks(
			[...new Set($remoteDataStore.map((d) => d.count))].sort((a, b) => a - b),
			3
		);
		console.log(b, calc2, 'calc2222', [...new Set(calc2)]);
	};

	let addBreak = () => {
		console.log('addBreak');
		breaksCount++;
		console.log('breaksCount in removeBreak', breaksCount);
	};
</script>

{#if !$remoteDataStore || $remoteDataStore.length === 0}{:else}
	<div
		class="max-h-90 overflow-auto absolute bottom-20 z-50 left-[calc(62vw)] w-[calc(15vw)] mr-2 bg-zinc-100 text-stone-700"
	>
		{#if jetBreaksLegend && jetBreaksLegend.length > 0}
			{#each jetBreaksLegend as breakLegend, i}
				<div class="text-sm h-7 m-1 p-1 flex flex-row items-left align-middle">
					<div
						class="w-4 h-4 bg-zinc-200 text-stone-700 p-1 outline-1 outline-stone-700"
						style="background-color:{breakLegend.color}"
					></div>
					<div class="ml-2 text-xs w-auto h-10">{breakLegend.label}</div>
				</div>
			{/each}
			<span class="text-xs text-center m-1 p-1"
				>Currently showing {jetBreaksLegend?.length} breaks</span
			>
			<aside class="flex flex-row justify-center gap-2 m-1 p-1">
				{#if jetBreaksLegend.length > 3}
					<Button
						onclick={removeBreak}
						variant="outline"
						size="xs"
						class="text-xs bg-zinc-200 text-stone-700 p-1 hover:bg-zinc-300 cursor-pointer outline-1 border-1 border-stone-700"
						>Remove</Button
					>
				{/if}

				<Button
					onclick={addBreak}
					variant="outline"
					size="xs"
					class="text-xs bg-zinc-200 text-stone-700 p-1 hover:bg-zinc-300 cursor-pointer outline-1 border-1 border-stone-700"
					>Add</Button
				>
			</aside>
		{:else}
			<div class="text-sm h-7 m-1 p-1 flex flex-row items-left align-middle">
				<div
					class="w-4 h-4 bg-zinc-200 text-stone-700 p-1 outline-1 outline-stone-700"
					style="background-color:gray"
				></div>
				<div class="ml-2 text-xs w-auto h-10">No data to show?</div>
			</div>
		{/if}
	</div>
{/if}
