// PNGP generic data store (Svelte 5 runes)
// - Inspired by `src/lib/stores/datatables/species.svelte.js`
// - Uses $state/$derived
// - Prevents re-entrant loads via in-flight guard
// - Uses SvelteKit base path for HTTP assets under `static/`

// @ts-nocheck
import { base } from '$app/paths';

// Core state
export const records = $state([]);
export const filter = $state({
	valley: '',
	year: '',
	id: ''
});

// Derived filtered view
export const filteredRecords = $derived(() => {
	if (!records?.length) return [];
	return records.filter((row) => {
		const matchValley =
			!filter.valley ||
			(row.valley_name && row.valley_name.toLowerCase().includes(filter.valley.toLowerCase()));
		const matchYear = !filter.year || String(row.year) === String(filter.year);
		const matchId = !filter.id || String(row.id ?? row.tax_id ?? '') === String(filter.id);
		return matchValley && matchYear && matchId;
	});
});

let isLoading = false;

/**
 * Load JSON from static/data path.
 * Place files under `static/data/your-file.json`.
 *
 * @param {string} filename - File name in `static/data/` (e.g. 'species_data.json')
 * @returns {Promise<any[]>} Loaded array
 */

export async function loadData(filename) {
	if (isLoading) return records; // guard re-entry
	isLoading = true;
	try {
		const res = await fetch(`${base}/data/${filename}`);
		if (!res.ok) throw new Error(`Failed to fetch ${filename}: ${res.status}`);
		const data = await res.json();
		// Replace array content in-place to preserve references
		records.splice(0, records.length, ...(Array.isArray(data) ? data : []));
		return records;
	} finally {
		isLoading = false;
	}
}

/**
 * Update filter partially
 * @param {{ valley?: string; year?: string|number; id?: string|number }} partial
 */
export function setFilter(partial) {
	Object.assign(filter, partial);
}

export function clearFilter() {
	filter.valley = '';
	filter.year = '';
	filter.id = '';
}

// Mutations for local edits
export function addRecord(record) {
	records.push(record);
}

export function removeRecord(index) {
	records.splice(index, 1);
}

export function updateRecord(index, updates) {
	Object.assign(records[index], updates);
}

// ---------------------------------------------
// Sidebar-related state and remote data (ported
// from src/lib/stores/new_sidebar_stores.js)
// ---------------------------------------------

// Active UI state
export const activeItem = $state('test');
export const filteredTaxInput = $state([]);
export const isMapInitialized = $state(false);
export const selectedGrid = $state('pngp_grid_1km_topo');

// Filters and remote data
export const paramsFilter = $state({
	filtersActive: true,
	selIds: [],
	yArrSel: [],
	vArrSel: [],
	yArr: [],
	vArr: [],
	manuallyFilteredItemsSpecies: [],
	autofilteredItemsSpecies: []
});

export const remoteData = $state([]);
export const navigating = $state(true);

/**
 * Fetch remote grid data and update `remoteData`.
 * Mirrors previous behavior while using Svelte 5 runes-state.
 *
 * @param {Array<string|number>} ids
 * @param {string} [gridOverride]
 * @param {{ yArrSel?: (string|number)[]; vArrSel?: (string|number)[] }} [paramsOverride]
 */
export async function fetchRemoteData(ids, gridOverride, paramsOverride) {
	console.log(
		'📡 FETCHREMOTEDATA CALLED with',
		ids?.length ?? 0,
		'ids, grid:',
		gridOverride ?? selectedGrid
	);
	console.trace('FETCHREMOTEDATA TRACE');

	const filterParams = paramsOverride ?? paramsFilter;

	try {
		const grid = gridOverride ?? selectedGrid;
		const years = filterParams.yArrSel?.join(',') ?? '';
		const valleys = filterParams.vArrSel?.join(',') ?? '';
		const url =
			'https://pere.gis-ninja.eu/pngp_phps/get_grids.php?ids=' +
			(ids?.join(',') ?? '') +
			'&grid=' +
			grid +
			'&years=' +
			years +
			'&valleys=' +
			valleys;

		console.log('url being', url);
		const response = await fetch(url, { method: 'GET' });
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const jsonData = await response.json();
		const mappedData = jsonData.map((d) => ({ ...d, pol_id: +d.pol_id }));

		// Change-detection similar to original store
		const lengthChanged = remoteData.length !== mappedData.length;
		const firstItemChanged =
			remoteData.length > 0 &&
			mappedData.length > 0 &&
			remoteData[0].pol_id !== mappedData[0].pol_id;

		if (lengthChanged || firstItemChanged || remoteData.length === 0) {
			console.log('📦 SETTING remoteData with', mappedData.length, 'items');
			console.trace('REMOTEDATASTORE SET TRACE');
			remoteData.splice(0, remoteData.length, ...mappedData);
		} else {
			console.log('📦 SKIPPING remoteData update - data unchanged');
		}
	} catch (error) {
		console.error('Error fetching remote data:', error);
		remoteData.splice(0, remoteData.length); // clear on error
	}
}

// Convenience setters
export function setActiveItem(value) {
	activeItem = value;
}

export function setSelectedGrid(value) {
	selectedGrid = value;
}

export function setParamsFilter(partial) {
	Object.assign(paramsFilter, partial);
}
