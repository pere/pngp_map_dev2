//@ts-nocheck
// Svelte 5 Stores - Rewritten from legacy Svelte 4 stores
// Following the project's Svelte 5 store patterns and documentation

class runesStore {
  // Active item in the sidebar
  activeItem = $state([]);

  // Filtered taxonomy input
  filteredTaxInput = $state([]);

  // Map initialization state
  mapInitialized = $state(false);

  // Selected grid type
  selGrid = $state("pngp_grid_1km_topo");

  // Manually filtered items for species
  manuallyFilteredItemsSpecies = $state([]);

  // Navigation state
  navigating = $state(true);

  // Remote data from API calls
  remoteData = $state([]);

  // Filter parameters object
  paramsFilter = $state({
    updateMapOnSelection: null,
    filtersActive: true,
    allIds: [],
    selIds: [],
    yArrSel: [],
    vArrSel: [],
    yArr: [],
    vArr: [],
    manuallyFilteredItemsSpecies: [],
    autofilteredItemsSpecies: [],
    plottingCheckedItems: false,
  });

  // Derived values
  hasRemoteData = $derived(this.remoteData.length > 0);
  hasActiveFilters = $derived(
    this.paramsFilter.yArrSel.length > 0 ||
    this.paramsFilter.vArrSel.length > 0
  );
  isMapReady = $derived(this.mapInitialized && this.hasRemoteData);
  filterCount = $derived(
    this.paramsFilter.yArrSel.length + this.paramsFilter.vArrSel.length
  );

  // Methods for updating state
  setActiveItem(item) {
    this.activeItem = item;
  }

  setFilteredTaxInput(input) {
    this.filteredTaxInput = input;
  }

  setMapInitialized(initialized) {
    this.mapInitialized = initialized;
  }

  setSelGrid(grid) {
    this.selGrid = grid;
  }

  setManuallyFilteredItemsSpecies(items) {
    this.manuallyFilteredItemsSpecies = items;
  }

  setNavigating(nav) {
    this.navigating = nav;
  }

  setRemoteData(data) {
    this.remoteData = [...data];
    console.log('remoteData in runes store',this.remoteData);
  }

  updateParamsFilter(updates) {
    this.paramsFilter = { ...this.paramsFilter, ...updates };
  }

  setParamsFilterAllIds(ids) {
    this.paramsFilter = {
      ...this.paramsFilter,
      allIds: [...ids]
    };
  }

  setParamsFilterSelIds(ids) {
    this.paramsFilter = {
      ...this.paramsFilter,
      selIds: [...ids]
    };
  }

  setYearFilters(years) {
    this.paramsFilter = {
      ...this.paramsFilter,
      yArrSel: [...years]
    };
  }

  setValleyFilters(valleys) {
    this.paramsFilter = {
      ...this.paramsFilter,
      vArrSel: [...valleys]
    };
  }

  setPlottingCheckedItems(plotting) {
    this.paramsFilter = {
      ...this.paramsFilter,
      plottingCheckedItems: plotting
    };
  }

  clearAllFilters() {
    this.paramsFilter = {
      updateMapOnSelection: null,
      filtersActive: true,
      allIds: [],
      selIds: [],
      yArrSel: [],
      vArrSel: [],
      yArr: [],
      vArr: [],
      manuallyFilteredItemsSpecies: [],
      autofilteredItemsSpecies: [],
      plottingCheckedItems: false,
    };
    this.remoteData = [];
  }

  reset() {
    this.activeItem = [];
    this.filteredTaxInput = [];
    this.mapInitialized = false;
    this.selGrid = "pngp_grid_1km_topo";
    this.manuallyFilteredItemsSpecies = [];
    this.navigating = true;
    this.remoteData = [];
    this.clearAllFilters();
  }

  // Async method for fetching remote data
  async fetchRemoteData(ids, params = null) {
    console.log(
      "📡 runes mode FETCHREMOTEDATA CALLED with",
      ids.length,
      "ids, grid:",
      this.selGrid
    );
    console.trace("runes modeFETCHREMOTEDATA TRACE");

    const filterParams = params || this.paramsFilter;
    console.log("paramsFilter in store", this.paramsFilter);

    try {
      let url =
        "https://pere.gis-ninja.eu/pngp_phps_new/get_grids.php?ids=" +
        ids.join(",") +
        "&grid=" +
        this.selGrid +
        "&years=" +
        filterParams.yArrSel?.join(",") +
        "&valleys=" +
        filterParams.vArrSel?.join(",");

      console.log("url being", url);
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        this.clearAllFilters();
        throw new Error("Network response was not ok");
      }

      const jsonData = await response.json();
      const mappedData = jsonData.map((d) => {
        return {
          ...d,
          pol_id: +d.pol_id,
        };
      });

      // Check if the data length or first item pol_id changed (simple comparison)
      const currentData = this.remoteData;
      const lengthChanged = currentData.length !== mappedData.length;
      const firstItemChanged =
        currentData.length > 0 &&
        mappedData.length > 0 &&
        currentData[0].pol_id !== mappedData[0].pol_id;




      if (lengthChanged || firstItemChanged || currentData.length === 0) {
        console.log(
          "📦 SETTING remoteDataStore with",
          mappedData.length,
          "items"
        );
        console.trace("REMOTEDATASTORE SET TRACE");

        this.setRemoteData(mappedData);
        this.setParamsFilterAllIds(ids);
        this.setPlottingCheckedItems(false);

        console.log("paramsFilter in store222", this.paramsFilter);
      } else {
        console.log("📦 SKIPPING remoteDataStore update - data unchanged");
      }
    } catch (error) {
      console.error("Error fetching remote data:", error);
      this.setPlottingCheckedItems(false);
      this.setRemoteData([]); // Set empty array on error
    }
  }
}

// Export single instance following Svelte 5 runes pattern
export const runeStore = new runesStore();

// Direct exports for Svelte 5 - use runes directly, no get/set needed
export const activeItemStore = runeStore.activeItem;
export const filteredTaxInputStore = runeStore.filteredTaxInput;
export const mapInitialized = runeStore.mapInitialized;
export const selGrid = runeStore.selGrid;
export const manuallyFilteredItemsSpecies = runeStore.manuallyFilteredItemsSpecies;
export const paramsFilter = runeStore.paramsFilter;
export const remoteDataStore = runeStore.remoteData;
export const navigating = runeStore.navigating;

// Export derived values
export const hasRemoteData = runeStore.hasRemoteData;
export const hasActiveFilters = runeStore.hasActiveFilters;
export const isMapReady = runeStore.isMapReady;
export const filterCount = runeStore.filterCount;

// Export methods
export const setActiveItem = runeStore.setActiveItem.bind(runeStore);
export const setFilteredTaxInput = runeStore.setFilteredTaxInput.bind(runeStore);
export const setMapInitialized = runeStore.setMapInitialized.bind(runeStore);
export const setSelGrid = runeStore.setSelGrid.bind(runeStore);
export const setManuallyFilteredItemsSpecies = runeStore.setManuallyFilteredItemsSpecies.bind(runeStore);
export const setNavigating = runeStore.setNavigating.bind(runeStore);
export const setRemoteData = runeStore.setRemoteData.bind(runeStore);
export const updateParamsFilter = runeStore.updateParamsFilter.bind(runeStore);
export const setParamsFilterAllIds = runeStore.setParamsFilterAllIds.bind(runeStore);
export const setParamsFilterSelIds = runeStore.setParamsFilterSelIds.bind(runeStore);
export const setYearFilters = runeStore.setYearFilters.bind(runeStore);
export const setValleyFilters = runeStore.setValleyFilters.bind(runeStore);
export const setPlottingCheckedItems = runeStore.setPlottingCheckedItems.bind(runeStore);
export const clearAllFilters = runeStore.clearAllFilters.bind(runeStore);
export const reset = runeStore.reset.bind(runeStore);

// Export the async function
export const fetchRemoteData = runeStore.fetchRemoteData.bind(runeStore);
