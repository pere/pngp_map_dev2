//create a store for the active item in the sidebar without using writable
import { writable, derived, get } from 'svelte/store';
export const activeItemStore = writable('test');
export const filteredTaxInputStore = writable([]);
export const mapInitialized = writable(false);
export const selGrid = writable('pngp_grid');
export const manuallyFilteredItemsSpecies = writable([]);
export const paramsFilter = writable({
	filtersActive: true,
	selIds: [],
	yArrSel: [],
	vArrSel: [],
	yArr: [],
	vArr: [],
	manuallyFilteredItemsSpecies: [],
	autofilteredItemsSpecies: []
});
// Create a writable store for the remote data
export const remoteDataStore = writable([]);
export const navigating = writable(true);
// Function to fetch data from PHP endpoint and update store
export async function fetchRemoteData(ids, selGrid, params = null) {
	console.log('📡 FETCHREMOTEDATA CALLED with', ids.length, 'ids, grid:', get(selGrid));
	console.trace('FETCHREMOTEDATA TRACE');
	const filterParams = params || get(paramsFilter);
	console.log('paramsFilter in store', filterParams);

	try {
		let url =
			'https://pere.gis-ninja.eu/pngp_phps/get_grids.php?ids=' +
			ids.join(',') +
			'&grid=' +
			get(selGrid) +
			'&years=' +
			filterParams.yArrSel?.join(',') +
			'&valleys=' +
			filterParams.vArrSel?.join(',');

		console.log('url being', url);
		const response = await fetch(url, {
			method: 'GET'
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const jsonData = await response.json();
		const mappedData = jsonData.map((d) => {
			return {
				...d,
				pol_id: +d.pol_id
			};
		});

		// Check if the data length or first item pol_id changed (simple comparison)
		const currentData = get(remoteDataStore);
		const lengthChanged = currentData.length !== mappedData.length;
		const firstItemChanged =
			currentData.length > 0 &&
			mappedData.length > 0 &&
			currentData[0].pol_id !== mappedData[0].pol_id;

		if (lengthChanged || firstItemChanged || currentData.length === 0) {
			console.log('📦 SETTING remoteDataStore with', mappedData.length, 'items');
			console.trace('REMOTEDATASTORE SET TRACE');
			remoteDataStore.set([...mappedData]);
		} else {
			console.log('📦 SKIPPING remoteDataStore update - data unchanged');
		}
	} catch (error) {
		console.error('Error fetching remote data:', error);
		remoteDataStore.set([]); // Set empty array on error
	}
}
