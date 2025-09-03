<script>
	//@ts-nocheck
	//@ts-ignore

	import { base } from '$app/paths';

	import { filteredTaxInputStore } from '$lib/stores/new_sidebar_stores.js';

	let { symbolColor: symbolColorProp, map } = $props();

	let sp_tax_counts_dbase = $state([]);
	import { paramsFilter } from '$lib/stores/new_sidebar_stores.js';
	import { yearFilter } from '$lib/stores/store_pngp';
	import { parse } from 'svelte/compiler';

	function debounce(fn, delay = 300) {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	}

	let paramsFilterStore = $derived(paramsFilter);

	$effect(async () => {
		try {
			// Load tax_data_joined_new.json
			//static/data/   !!!!

			const response = await fetch(`/data/new_sources/tax_data_joined_new.json`);
			if (response.ok) {
				const data = await response.json();

				sp_tax_counts_dbase.push(...data);

				/*     {
    "id": 1,
    "species_n": "Hirundo rupestris",
    "preferred_common_name": "Eurasian Crag-Martin",
    "iconic_taxon_name": "Aves",
    "wikipedia_url": "http://en.wikipedia.org/wiki/Eurasian_crag_martin",
    "matched_term": "Hirundo rupestris",
    "medium_url": "https://static.inaturalist.org/photos/64291747/medium.jpg",
    "pngp_data": null
  }, */
				console.warn('sp_tax_counts_dbase in effect', sp_tax_counts_dbase);
			}
		} catch (e) {
			console.error('Failed to load tax_data_joined_new.json:', e);
		}
	});
	//create a derived based on symbolColor.legend
	let symbolColorName = $derived.by(() => {
		// Convert proxy to plain array for reliable operations

		if (!sp_tax_counts_dbase || sp_tax_counts_dbase.length === 0) return null;

		let obj = symbolColorProp;

		if (obj?.legend?.length > 0) {
			let newObj = obj.ids.map((tax_id, i) => {
				console.log('Looking for tax_id:', tax_id, 'type:', typeof tax_id);
				const found = sp_tax_counts_dbase.find((d) => d.tax_id === tax_id);
				console.log('Found match:', found);

				return {
					id: tax_id,
					color: obj.colorScale[i],
					name: found?.species_n || 'no name',
				};
			});

			console.log('newObj', newObj);
			return newObj;
		}

		return null;
	});

	$effect(() => {
		console.log('paramsFilterStore', paramsFilter);
	});

	/*    $effect(()=>{
        if (symbolColor?.legend?.length>0)
        console.log('symbolColorName in pointsLegend',symbolColorName);
    }) */

	let showSpecies = $state(true);

	let debouncedValue = $state(50);
	let handleDebouncedChange = debounce((value) => {
		debouncedValue = value;
	});

	let mouseovered = $state();
	let changedArr = $state([]);
	let handleMouseOver = (d) => {
		console.log('d in handleMouseOver', d);
		let found = sp_tax_counts_dbase.find((r) => r.tax_id === d.id);
		console.log('Found match in handleMouseOver:', found);
		mouseovered = {
			...d,
			...found,
		};
	};

	let baseCircleRadiusExpression = [
		'interpolate',
		['linear'],
		['zoom'],
		9,
		2,
		11,
		4,
		15,
		6,
	];

	function generateRadiusExpression(f, changedArr) {
		/* let test = [
			'interpolate',
			['linear'],
			['zoom'],

			// zoom = 9
			9,
			[
				'case',
				['==', ['get', 'tax_id'], 58],
				0.6,
				['==', ['get', 'tax_id'], 39],
				6,
				2, // default
			],

			// zoom = 11
			11,
			[
				'case',
				['==', ['get', 'tax_id'], 58],
				1.2,
				['==', ['get', 'tax_id'], 39],
				12,
				4, // default
			],

			// zoom = 15
			15,
			[
				'case',
				['==', ['get', 'tax_id'], 58],
				1.8,
				['==', ['get', 'tax_id'], 39],
				18,
				6, // default
			],
		]; */
		const [, , , ...zoomStops] = baseCircleRadiusExpression; // Extract zoom stops

		const expression = ['interpolate', ['linear'], ['zoom']];
		console.log('zoomStops', zoomStops);

		/*   11,
	["case", ["==", ["get", "tax_id"], 58, 13.280467690946189]], */
		for (let i = 0; i < zoomStops.length; i += 2) {
			expression.push(zoomStops[i]); // zoom level
			let ori_r = zoomStops[i + 1];
			let _this_expression = ['case'];

			changedArr.forEach((item, i) => {
				var arr = ['==', ['get', 'tax_id'], item.id];

				_this_expression.push(arr);
				_this_expression.push(ori_r * item.r);
			});
			// default radius if no tax_id matches
			_this_expression.push(ori_r); // default radius
			expression.push(_this_expression);
		}

		console.log('Final expression:', expression);
		// Add default radius for unmatched tax_ids

		return expression;
	}

	let handleSelectedRadius = (e) => {
		let val = parseFloat(e.target.value);
		console.log('Selected radius value:', val);
		/* debugger;
		if (val === 0) val = 1;
		if (val > 0) val = 1 + val;
		if (val < 0) val = 1 / (1 - Math.abs(val)); */

		console.log('Adjusted radius value:', val, Math.exp(val));
		//make sure we do not duplicate entries in changedArr
		changedArr = [
			...changedArr.filter((d) => d.id !== mouseovered.tax_id),
			{ r: Math.exp(val), id: mouseovered.tax_id, inputVal: val.toFixed(2) },
		];
		console.log('changedArr', changedArr, mouseovered);

		console.log(
			generateRadiusExpression(baseCircleRadiusExpression, changedArr)
		);

		let test = [
			'interpolate',
			['linear'],
			['zoom'],

			// zoom = 9
			9,
			[
				'case',
				['==', ['get', 'tax_id'], 58],
				0.6,
				['==', ['get', 'tax_id'], 39],
				6,
				2, // default
			],

			// zoom = 11
			11,
			[
				'case',
				['==', ['get', 'tax_id'], 58],
				1.2,
				['==', ['get', 'tax_id'], 39],
				12,
				4, // default
			],

			// zoom = 15
			15,
			[
				'case',
				['==', ['get', 'tax_id'], 58],
				1.8,
				['==', ['get', 'tax_id'], 39],
				18,
				6, // default
			],
		];
		map.setPaintProperty(
			'pngp_obs_simple',
			'circle-radius',
			//test
			generateRadiusExpression(baseCircleRadiusExpression, changedArr)
		);
		console.warn(
			'getStyle',
			map.getStyle().layers.find((d) => d.id === 'pngp_obs_simple')
		);
		/*  filteredTaxInputStore.update(current => {
      return {
        ...current,
        selectedRadius: val
      };
    }); */
	};

	const debouncedHandleSelectedRadius = debounce(handleSelectedRadius, 200);
	const mouseoverDebounced = debounce(handleMouseOver, 500);
	const mouseoutDebounced = debounce(() => {
		mouseovered = null;
	}, 200);

	$effect(() => {
		if (mouseovered) {
			console.trace();
			console.log('mouseovered changed', mouseovered);
		}
	});
</script>

{#if symbolColorName}
	<div
		class="legend-container overflow-y-auto max-h-[400px]"
		onmouseleave={() => (mouseovered = null)}
	>
		<h1>Legend with {symbolColorName.length} species</h1>

		<div class="flex flex-row items-center">
			<input
				type="checkbox"
				onclick={() => {
					showSpecies = !showSpecies;
					if (showSpecies) {
						if (map) {
							console.log('showSpecies is true');
							if (
								map
									.getStyle()
									.layers.find((d) => d.id === 'pngp_obs_simple')
							) {
								map.setLayoutProperty(
									'pngp_obs_simple',
									'visibility',
									'visible'
								);
								map.moveLayer('pngp_obs_simple');
							}
						}
					} else {
						console.log('showSpecies is false');
						if (
							map.getStyle().layers.find((d) => d.id === 'pngp_obs_simple')
						) {
							map.setLayoutProperty(
								'pngp_obs_simple',
								'visibility',
								'none'
							);
						}
					}
				}}
				bind:checked={showSpecies}
				class="mr-2"
			/>
			<label class="text-xs" for="showSpecies">Show species</label>
		</div>
		<div class="text-xs w-full">Hover species to change style</div>

		<div class="{showSpecies ? '' : 'hidden_sp'} sp_container">
			{#each symbolColorName as d, i (d.id)}
				{@const arr = changedArr.find((r) => r.id === d.id)}
				{@const baseSize = 12}
				{@const scaleFactor = arr?.inputVal
					? 1 + parseFloat(arr.inputVal) * 0.5
					: 1}
				{@const circleSize = Math.max(6, Math.min(24, baseSize * scaleFactor))}

				<button
					class="hover:cursor-pointer legend-item flex flex-col items-left p-1 m-1 ml-0 pl-0 {mouseovered &&
					mouseovered.tax_id === d.id
						? 'bg-slate-200 border border-slate-400'
						: ''}"
					onmouseenter={() => mouseoverDebounced(d)}
				>
					<div class="w-full flex flex-row items-center">
						<div
							class="legend-color m-1 rounded-full border border-slate-600"
							style="background-color: {d.color}; width: {circleSize}px; height: {circleSize}px;"
						></div>
						<div class="legend-text">{d.name}</div>
					</div>

					{#if mouseovered && mouseovered.tax_id === d.id}
						{@const arr = changedArr.find((r) => r.id === d.id)}
						{@const newR = (arr?.r).toFixed(2) || 0}
						{@const baseSize = 20}
						{@const scaleFactor = arr?.inputVal
							? 1 + parseFloat(arr.inputVal) * 0.5
							: 1}
						{@const imageSize = Math.max(
							10,
							Math.min(40, baseSize * scaleFactor)
						)}

						<div class="ml-1 block w-[100] legend-hover-info">
							<button class="flex flex-row">
								<img
									src={mouseovered?.medium_url}
									alt={d.name}
									class="w-20 h-20 object-cover"
								/>
								<div class="ml-2 text-left">
									<h2 class="text-xs font-bold">
										{mouseovered?.pngp_data.name_it}
									</h2>
									<h2 class="text-xs font-bold">
										{mouseovered?.pngp_data.name_eng}
									</h2>
								</div>
							</button>
							<div>
								<label>Radius {arr?.inputVal > 0 ? '+' : '-'}{newR} %</label>
								<input
									oninput={debouncedHandleSelectedRadius}
									type="range"
									min="-2"
									max="2"
									step="0.2"
									value={arr?.inputVal || 0}
								/>
							</div>
						</div>
					{/if}
				</button>
			{/each}
			{#if $paramsFilter.yArrSel.length > 0}
				Data filtered by year {$paramsFilter.yArrSel.join(', ')}
			{:else}
				<div>No filter by year</div>
			{/if}
			{#if $paramsFilter.vArrSel.length > 0}
				Data filtered by valley {$paramsFilter.vArrSel.join(', ')}
			{:else}
				<div>No filter by valley</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.legend-container {
		position: absolute;
		top: 70px;
		right: 10px;
		background-color: white;
		padding: 5px;
		border-radius: 2px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
	}
	/* 	.legend-item {
		display: flex;
		align-items: center;
		gap: 10px;
	} */
	.hidden_sp {
		opacity: 0.2;
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
