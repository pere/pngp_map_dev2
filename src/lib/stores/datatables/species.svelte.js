// Svelte 5 species store
//@ts-nocheck
//@ts-ignore
import { base } from '$app/paths';
import data from '$lib/../data/all_sp_data.json';
export const species = $state([]);
export const filter = $state({ valley: '', year: '', tax_id: '' });

const _filteredSpecies = $derived(() => {
	return species.filter((row) => {
		//return all species if no filter is applied
		if (!filter.valley && !filter.year && !filter.tax_id) {
			console.log('No filter applied, returning all species');
			return true;
		}
		const matchValley =
			!filter.valley ||
			(row.valley_name && row.valley_name.toLowerCase().includes(filter.valley.toLowerCase()));
		const matchYear = !filter.year || String(row.year) === String(filter.year);
		const matchTaxId = !filter.tax_id || String(row.tax_id) === String(filter.tax_id);
		return matchValley && matchYear && matchTaxId;
	});
});

export function getFilteredSpecies() {
	return _filteredSpecies();
}
let loading = false;

export async function loadSpecies() {
	if (loading) return;
	loading = true;
	try {
		//static/data/   !!!!

		const res = await fetch(`${base}/data/species_data_test.json`);
		//const res = await fetch(`${base}/data/species_data_test.json`);
		const data = await res.json();
		species.splice(0, species.length, ...data);
		console.log('data from store', data);
		return data;
	} finally {
		console.log('loading species');
		loading = false;
	}
}

export function setFilter(newFilter) {
	Object.assign(filter, newFilter);
}

export function clearFilter() {
	filter.valley = '';
	filter.year = '';
	filter.tax_id = '';
}

export function addSpecies(record) {
	species.push(record);
}

export function removeSpecies(index) {
	species.splice(index, 1);
}

export function updateSpecies(index, updates) {
	Object.assign(species[index], updates);
}
