//@ts-nocheck

// Import the remoteDataStore to watch for changes
import { remoteDataStore, paramsFilter } from './new_sidebar_stores.js';
import { get } from 'svelte/store';

// Global store for remote data stats - wrap in an object to avoid reassignment issues
const basicRemoteDataStatsGlobalState = $state({
	data: [],
	isLoading: false,
	error: null,
	lastUpdateTime: null
});

// Export getters for the state
export const basicRemoteDataStats = () => basicRemoteDataStatsGlobalState.data;
export const isLoading = () => basicRemoteDataStatsGlobalState.isLoading;
export const error = () => basicRemoteDataStatsGlobalState.error;
export const lastUpdateTime = () => basicRemoteDataStatsGlobalState.lastUpdateTime;

// Helper variable to track the last known paramsFilter state
let lastParamsFilterSnapshot = {
	allIds: [],
	yArr: [],
	vArr: []
};

// Subscribe to paramsFilter changes using traditional store subscription
let unsubscribe = null;

// Function to make PHP GET call for stats
async function fetchRemoteDataStats(paramsFilterData) {
	if (!paramsFilterData || !paramsFilterData.allIds || paramsFilterData.allIds.length === 0) {
		console.log('🔍 No allIds available for stats calculation');
		basicRemoteDataStatsGlobalState.data = [];
		return;
	}

	console.log(
		'🔍 Starting to fetch remote data stats for',
		paramsFilterData.allIds.length,
		'pol_ids...'
	);
	basicRemoteDataStatsGlobalState.isLoading = true;
	basicRemoteDataStatsGlobalState.error = null;

	try {
		// Use allIds directly from paramsFilter
		const polIds = paramsFilterData.allIds.filter((id) => id != null);
		const allIds = paramsFilterData.allIds.filter((id) => id != null).join(',');

		if (allIds.length === 0) {
			throw new Error('No valid allIds found in remote data');
		}

		// Construct PHP endpoint URL with additional filter parameters
		const url = `https://pere.gis-ninja.eu/pngp_phps_new/get_basic_stats.php?ids=${allIds}&years=${(paramsFilterData.yArr || []).join(',')}&valleys=${(paramsFilterData.vArr || []).join(',')}`;

		console.log('🔍 Fetching stats from:', url);

		const response = await fetch(url, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const statsData = await response.json();

		// Process and store the stats data
		basicRemoteDataStatsGlobalState.data = Array.isArray(statsData) ? statsData : [];
		basicRemoteDataStatsGlobalState.lastUpdateTime = new Date().toISOString();

		console.log(
			'🔍 Loaded remote data stats:',
			basicRemoteDataStatsGlobalState.data.length,
			'records'
		);
	} catch (e) {
		basicRemoteDataStatsGlobalState.error = e.message;
		basicRemoteDataStatsGlobalState.data = [];
		console.error('🔍 Failed to fetch remote data stats:', e);
	} finally {
		basicRemoteDataStatsGlobalState.isLoading = false;
	}
}

// Function to check if the specific fields we care about have changed
function hasParamsFilterChanged(current, previous) {
	// Check if allIds array changed
	const allIdsChanged =
		JSON.stringify(current.allIds || []) !== JSON.stringify(previous.allIds || []);

	// Check if yArr array changed
	const yArrChanged = JSON.stringify(current.yArr || []) !== JSON.stringify(previous.yArr || []);

	// Check if vArr array changed
	const vArrChanged = JSON.stringify(current.vArr || []) !== JSON.stringify(previous.vArr || []);

	return allIdsChanged || yArrChanged || vArrChanged;
}

// Subscribe to paramsFilter changes using traditional store subscription
function initializeStoreWatcher() {
	if (unsubscribe) return; // Already initialized

	unsubscribe = paramsFilter.subscribe((currentParamsFilter) => {
		// Check if any of the fields we care about have changed
		const hasChanged = hasParamsFilterChanged(currentParamsFilter, lastParamsFilterSnapshot);

		if (hasChanged) {
			console.log('🔍 ParamsFilter changed (allIds, yArr, or vArr), fetching new stats...');
			console.log('Previous:', lastParamsFilterSnapshot);
			console.log('Current:', currentParamsFilter);

			// Update our snapshot
			lastParamsFilterSnapshot = {
				allIds: [...(currentParamsFilter.allIds || [])],
				yArr: [...(currentParamsFilter.yArr || [])],
				vArr: [...(currentParamsFilter.vArr || [])]
			};

			fetchRemoteDataStats(currentParamsFilter);
		}
	});
}

// Initialize the store watcher immediately when module is imported
initializeStoreWatcher();

// Helper functions following the same pattern as test.svelte.js
export const getBasicRemoteDataStats = () => $state.snapshot(basicRemoteDataStatsGlobalState.data);
export const findStatByPolId = (polId) =>
	basicRemoteDataStatsGlobalState.data.find((item) => item.pol_id === polId);
export const getStatsCount = () => basicRemoteDataStatsGlobalState.data.length;

// Function to manually trigger stats refresh (useful for testing or manual updates)
export const refreshStats = () => {
	const currentParamsFilter = get(paramsFilter);
	fetchRemoteDataStats(currentParamsFilter);
};

// Function to cleanup the subscription (useful for testing or cleanup)
export const cleanup = () => {
	if (unsubscribe) {
		unsubscribe();
		unsubscribe = null;
	}
};

// Export the store getter function (similar to test.svelte.js pattern)
export const get_basic_remote_data_stats_store = () => {
	return basicRemoteDataStats;
};
