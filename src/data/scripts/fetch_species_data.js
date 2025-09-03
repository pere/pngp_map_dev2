import fs from 'fs';
import path from 'path';

//@ts-ignore
//@ts-nocheck
// Read the tax_classif.json file
const taxData = JSON.parse(fs.readFileSync('./tax_classif.json', 'utf8'));

// Filter species with non-null species_n
const speciesData = taxData.filter(
	(item) =>
		item.tax_level === 'species' &&
		item.species_n !== null &&
		item.species_n !== undefined &&
		item.species_n.trim() !== ''
);
//.slice(0, 10); // Take only first 10 species

console.log(`Found ${speciesData.length} species to process`);

// Function to make API call and return response
async function fetchSpeciesData(species) {
	try {
		// Replace spaces with + for URL encoding
		const queryName = species.species_n.replace(/\s+/g, '+');
		const apiUrl = `https://api.inaturalist.org/v1/taxa?q=${queryName}`;

		console.log(`Fetching data for ${species.species_n} (ID: ${species.id})`);

		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Find the result that matches the species name exactly
		let selectedResult = null;
		if (data.results && data.results.length > 0) {
			// First try to find exact match
			selectedResult = data.results.find(
				(result) => result.name === species.species_n
			);
			// If no exact match, use the first result
			if (!selectedResult) {
				selectedResult = data.results[0];
			}
		}

		// Extract only the required fields
		const extractedData = selectedResult
			? {
					inaturalist_id: selectedResult.id || null,
					preferred_common_name: selectedResult.preferred_common_name || null,
					iconic_taxon_name: selectedResult.iconic_taxon_name || null,
					wikipedia_url: selectedResult.wikipedia_url || null,
					matched_term: selectedResult.matched_term || null,
					medium_url: selectedResult.default_photo?.medium_url || null,
				}
			: {
					preferred_common_name: null,
					iconic_taxon_name: null,
					wikipedia_url: null,
					matched_term: null,
					medium_url: null,
				};

		console.log(`✓ Fetched data for ${species.species_n}`);

		return {
			id: species.id,
			species_n: species.species_n,
			...extractedData,
		};
	} catch (error) {
		console.error(
			`✗ Error fetching data for ${species.species_n} (ID: ${species.id}):`,
			error.message
		);
		return {
			id: species.id,
			species_n: species.species_n,
			preferred_common_name: null,
			iconic_taxon_name: null,
			wikipedia_url: null,
			matched_term: null,
			medium_url: null,
			error: error.message,
		};
	}
}

// Process all species and save to single file
async function processAllSpecies() {
	console.log('Starting to fetch species data from iNaturalist API...');

	const allResults = [];

	for (let i = 0; i < speciesData.length; i++) {
		const species = speciesData[i];

		const result = await fetchSpeciesData(species);
		allResults.push(result);

		// Add a small delay to be respectful to the API
		if (i < speciesData.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
		}
	}

	// Save all results to a single JSON file
	//const filepath = path.join(callsDataDir, "simple2_new.json");
	fs.writeFileSync('./simple2_new.json', JSON.stringify(allResults, null, 2));

	console.log(`✅ Finished processing all species! Saved to simple2_new.json`);
	console.log(`Total species processed: ${allResults.length}`);
}

// Run the script
processAllSpecies().catch(console.error);
