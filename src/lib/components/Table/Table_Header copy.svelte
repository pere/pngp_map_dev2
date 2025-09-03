<script lang="ts">
	//@ts-nocheck
	// import type { TableHandler } from '$lib/src/client'

	let { table } = $props();

	let debounceTimeout;
	function debouncedSearch(e) {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
		debounceTimeout = setTimeout(() => {
			search.value = e.target.value;
			search.set();
			console.log('Search applied with value:', e.target.value);
		}, 2000);
	}

	const search = table.createSearch([
		'year',
		'month',
		'species_n',
		'name_it',
		'valley',
	]);

	//['year','month','species_n'])
</script>

<aside class="flex border-1 border-gray-300 rounded-md">
	<input
		class="border-1 border-gray-300 rounded-md placeholder:ml-2 w-70"
		type="text"
		bind:value={search.value}
		oninput={debouncedSearch}
		placeholder="Search by different fields..."
	/>
	<!-- <Filter {table} key="status"/>
    <Filter {table} key="priority"/> -->
	<!--   {#if table.filters.length > 0}
        <button class="flex" onclick={() => table.clearFilters()}>
            Reset
            <i class="micon">clear</i>
        </button>
    {/if} -->
</aside>

<!-- <ColumnVisibility {table}/> -->

<style>
	input {
		height: 32px;
		color: var(--font);
		border: 1px solid var(--grey);
	}
	button {
		padding: 0 8px;
		height: 32px;
		margin: 0 8px;
		border-radius: 4px;
		border: 1px solid var(--grey-lighten);
		background: var(--grey-lighten);
		color: var(--font);
	}
	button:hover {
		background: var(--grey);
	}
	i {
		font-size: 18px;
		margin-left: 8px;
	}
</style>
