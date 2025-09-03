import { writable, derived } from 'svelte/store';
//import { sp_tax_counts } from "$lib/data/sp_tax_counts.js";
// Store for clicked items in app-sidebar (e.g., an array of clicked item objects)
export const clickedSidebarItems = writable('');
export const mapInitialized = writable(false);

// Store for clicked items in NavMain (e.g., an array of clicked item objects)
/* export const clickedNavMainItems = writable("");
export const all_sp_tax_counts = writable(sp_tax_counts); */

// Writable filters
export const speciesFilter = writable('');
export const phylumFilter = writable('');
export const yearFilter = writable();

/* In Svelte stores, derived expects:
First parameter: An array of stores to subscribe to
Second parameter: A callback function that receives the values from those stores
The original code was trying to call the stores as functions inside a callback, which is incorrect syntax. The fixed version properly subscribes to the stores [allSpecies, speciesFilter, phylumFilter, yearFilter] and
receives their values as parameters [$all, $species, $phylum, $year] in the callback function */
// Derived store to return filtered results
// ✅ Exported filteredSpecies

// Create an object to hold the derived stores
/* let all_counts_var = writable({});

arr
  .forEach((name) => {
    all_counts_var[`${name}_counts`] = derived(
      [all_sp_tax_counts],
      ([$all_sp_tax_counts]) => {
        return $all_sp_tax_counts.reduce((acc, item) => {
          // Check if the specific taxonomic level is already in acc
          const existingItem = acc.find((d) => d.name === item[name]);

          if (existingItem) {
            // If it exists, add the count to the existing item
            existingItem.count += item.count;
          } else {
            // If it doesn't exist, add a new item
            acc.push({ name: item[name], count: item.count });
          }

          return acc;
        }, []);
      },
      []
    );
  })
  .then(() => {
    console.log($all_counts_var, "all_counts from store_pngp");
    console.log($all_counts_var, "all_counts from store_pngp");
    export const all_counts = writable(all_counts_var);
  }); */
