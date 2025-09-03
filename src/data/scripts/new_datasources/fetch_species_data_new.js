import fs from 'fs';
import path from 'path';

//@ts-ignore
//@ts-nocheck
// Read the tax_classif.json file
const taxData = JSON.parse(fs.readFileSync('./tax_classif_new.json', 'utf8'));

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

// Function to make API call with retry logic for rate limiting
async function fetchSpeciesData(species, retryCount = 0) {
	const maxRetries = 5;
	const baseDelay = 1000; // 1 second base delay

	try {
		// Replace spaces with + for URL encoding
		const queryName = species.species_n.replace(/\s+/g, '+');
		const apiUrl = `https://api.inaturalist.org/v1/taxa?q=${queryName}`;

		console.log(`Fetching data for ${species.species_n} (ID: ${species.tax_id}) - Attempt ${retryCount + 1}`);

		const response = await fetch(apiUrl);

		if (response.status === 429) {
			// Rate limited - implement exponential backoff
			if (retryCount < maxRetries) {
				const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000; // Add jitter
				console.log(`⏳ Rate limited. Waiting ${Math.round(delay)}ms before retry ${retryCount + 1}/${maxRetries}...`);

				await new Promise(resolve => setTimeout(resolve, delay));
				return fetchSpeciesData(species, retryCount + 1);
			} else {
				throw new Error(`Rate limited after ${maxRetries} retries`);
			}
		}

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
			tax_id: species.tax_id,
			species_n: species.species_n,
			...extractedData,
		};
	} catch (error) {
		console.error(
			`✗ Error fetching data for ${species.species_n} (ID: ${species.tax_id}):`,
			error.message
		);
		return {
			tax_id: species.tax_id,
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

// Process all species and save to single file with resume capability
async function processAllSpecies() {
	console.log('Starting to fetch species data from iNaturalist API...');

	const progressFile = './progress.json';
	const tempResultsFile = './species_data_temp.json';

	// Load existing progress if available
	let startIndex = 0;
	let allResults = [];

	try {
		if (fs.existsSync(progressFile)) {
			const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
			startIndex = progress.lastProcessedIndex + 1;
			console.log(`📋 Resuming from index ${startIndex} (${startIndex}/${speciesData.length})`);
		}

		if (fs.existsSync(tempResultsFile)) {
			allResults = JSON.parse(fs.readFileSync(tempResultsFile, 'utf8'));
			console.log(`📋 Loaded ${allResults.length} existing results`);
		}
	} catch (error) {
		console.log('No previous progress found, starting fresh');
	}

	for (let i = startIndex; i < speciesData.length; i++) {
		const species = speciesData[i];

		try {
			const result = await fetchSpeciesData(species);
			allResults.push(result);

			// Save progress every 10 items
			if (i % 10 === 0 || i === speciesData.length - 1) {
				fs.writeFileSync(tempResultsFile, JSON.stringify(allResults, null, 2));
				fs.writeFileSync(progressFile, JSON.stringify({ lastProcessedIndex: i, timestamp: new Date().toISOString() }));
				console.log(`💾 Progress saved at index ${i}`);
			}

			// Add a longer delay to be respectful to the API and avoid rate limiting
			if (i < speciesData.length - 1) {
				const delay = 500 + Math.random() * 300; // 500-800ms delay with jitter
				console.log(`⏳ Waiting ${Math.round(delay)}ms before next request... (${i + 1}/${speciesData.length})`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		} catch (error) {
			console.error(`❌ Failed to process ${species.species_n}:`, error.message);
			// Save progress even on error
			fs.writeFileSync(progressFile, JSON.stringify({ lastProcessedIndex: i, timestamp: new Date().toISOString() }));
			throw error; // Re-throw to stop processing
		}
	}

	// Final save and cleanup
	fs.writeFileSync('./species_data_new.json', JSON.stringify(allResults, null, 2));

	// Clean up temporary files
	if (fs.existsSync(progressFile)) fs.unlinkSync(progressFile);
	if (fs.existsSync(tempResultsFile)) fs.unlinkSync(tempResultsFile);

	console.log(`✅ Finished processing all species! Saved to species_data_new.json`);
	console.log(`Total species processed: ${allResults.length}`);
}

// Run the script
processAllSpecies().catch(console.error);
