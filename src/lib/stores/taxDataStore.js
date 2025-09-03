import { writable } from "svelte/store";
import { base } from "$app/paths";
export const taxDataStore = writable([]);
export const isDataLoaded = writable(false);
export const targetIds = writable([]);

export async function loadTaxonomyData() {
  try {
    console.log("🔄 Starting to load taxonomy data...");
    //const response = await fetch(`${base}/data/tax_data_joined_new.json`);
    const response = await fetch(`/data/new_sources/tax_data_joined_new_geo.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("✅ Taxonomy data loaded successfully:", data.length, "items");
    console.log("✅ First item structure:", data[0]);

    taxDataStore.set(data);

    // Set the first 10 species IDs as targets
    const first10Ids = data.slice(0, 10).map((species) => species.tax_id);
    targetIds.set(first10Ids);

    isDataLoaded.set(true);
    console.log(`📦 Store updated with ${data.length} taxonomy items`);
    console.log("🎯 First 10 IDs set as targets:", first10Ids);
  } catch (error) {
    console.error("❌ Failed to load taxonomy data:", error);
    taxDataStore.set([]);
    targetIds.set([]);
    isDataLoaded.set(false);
  }
}
