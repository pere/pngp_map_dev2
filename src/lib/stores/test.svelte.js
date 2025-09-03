//@ts-nocheck
import { base } from "$app/paths";
export const get_tax_data_joined_store = () => {
  return tax_data_joined_store;
};

// Global store for tax data - wrap in an object to avoid reassignment issues
const taxInfoGlobalState = $state({
  data: [],
  isLoading: false,
  error: null,
});

// Export getters for the state
export const tax_data_joined_store = () => taxInfoGlobalState.data;
export const isLoading = () => taxInfoGlobalState.isLoading;
export const error = () => taxInfoGlobalState.error;

// Load data immediately when module is imported (not in $effect)
let loadPromise = null;


async function loadTaxData() {
  if (taxInfoGlobalState.data.length > 0) return; // Already loaded
  if (loadPromise) return loadPromise; // Already loading

  console.log("Starting to load tax_data_joined_new.json...");

  loadPromise = (async () => {
    taxInfoGlobalState.isLoading = true;
    taxInfoGlobalState.error = null;

    try {
      // Now the file is available in static/data/ and can be fetched
      const response = await fetch("/data/new_sources/tax_data_joined_new.json");

      if (response.ok) {
        const data = await response.json();
        taxInfoGlobalState.data.push(...data);
        console.log(
          "Loaded tax_data_joined_store:",
          taxInfoGlobalState.data.length,
          "records"
        );
      } else {
        taxInfoGlobalState.error = `HTTP ${response.status}: ${response.statusText}`;
        console.error("Failed to load:", taxInfoGlobalState.error);
      }
    } catch (e) {
      taxInfoGlobalState.error = e.message;
      console.error("Failed to load tax_data_joined_new.json:", e);
    } finally {
      taxInfoGlobalState.isLoading = false;
    }
  })();

  return loadPromise;
}

// Start loading immediately when this module is imported
loadTaxData();

// Helper functions
export const getTaxData = () => $state.snapshot(taxInfoGlobalState.data);
export const findTaxById = (id) =>
  taxInfoGlobalState.data.find((item) => item.tax_id === id);
export const findTaxBySpeciesName = (name) =>
  taxInfoGlobalState.data.find((item) => item.species_n === name);
