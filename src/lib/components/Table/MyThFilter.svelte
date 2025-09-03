<script>
	//@ts-nocheck
	/* import type { TableHandlerInterface, Field } from '@vincjo/datatables'; */
	/* import type { Check } from '$lib/src/client'; */

	let { table, field, name, check } = $props();

	let value = '';
	const filter = table.createFilter(field, check).init(value);

	let debounceTimeout = null;

	function debouncedFilter(e) {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
		debounceTimeout = setTimeout(() => {
			filter.value = e.target.value;
			filter.set();
			console.log('Filter applied with value:', e.target.value);
		}, 2000);
	}
</script>

<th>
	<div>{name}</div>
	<div>
		<input
			class="border-1 border-gray-300 rounded-md placeholder:ml-2"
			type="text"
			placeholder={table.i18n.filter}
			spellcheck="false"
			bind:value={filter.value}
			oninput={debouncedFilter}
		/>
	</div>
</th>

<style>
	th {
		border-bottom: 1px solid var(--grey, #e0e0e0);
	}
	input {
		width: 100%;

		border: 1px solid var(--grey, #e0e0e0);
		text-align: left;
		padding: 0 20px;
		background: inherit;
		outline: 1px;
		border-radius: 0;
		font-size: 14px;
		color: var(--font-grey, #757575);
	}
	input::placeholder {
		color: var(--grey, #bdbdbd);
		font-size: 13px;
	}
	input:focus {
		outline: none;
		border: none;
	}
</style>
