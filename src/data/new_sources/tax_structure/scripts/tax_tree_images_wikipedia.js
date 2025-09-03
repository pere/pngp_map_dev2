import fs from 'fs';

/**
 * Taxonomic Tree Image Fetcher
 *
 * This script fetches images from iNaturalist API for taxonomic data and creates
 * a comprehensive tree structure with images at all levels.
 *
 * Usage: node tax_tree_images.js
 *
 * Configuration:
 * - INPUT_FILE: Source taxonomic data file
 * - OUTPUT_FILE: Destination file for tree with images
 * - TARGET_CLASSES: Array of class names to process
 * - MAX_TOP_LEVEL_CHILDREN: Number of direct children to process per class
 * - API_DELAY: Delay between API calls (ms) to avoid rate limiting
 */

// Configuration
const CONFIG = {
  //INPUT_FILE: "./taxonomic_tree_images.json",
  INPUT_FILE:'./taxonomicTreeInfo.json',
  OUTPUT_FILE: "taxonomic_tree_images_wikipedia_final.json",
  TARGET_CLASSES: [
    "Aves",
    "Mammalia",
    "Insecta",
    "Amphibia",
    "Reptilia",
    "Arachnida",
    "Actinopterygii",
    "Gastropoda",
    "Clitellata",
  ],
  MAX_TOP_LEVEL_CHILDREN: 500,
  API_DELAY: 1000, // 1 second delay between requests
  RATE_LIMIT_DELAY: 5000, // 5 seconds when rate limited
  BASE_API_URL: "https://api.inaturalist.org/v1/observations",
  WIKIPEDIA_API_URL: "https://en.wikipedia.org/api/rest_v1/page/summary/",
};

// Global statistics
let stats = {
    totalRequests: 0,
    successfulImages: 0,
    failedImages: 0,
    rateLimitHits: 0
};

/**
 * Add delay between API calls
 * @param {number} ms - Milliseconds to delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch image from iNaturalist API for a given taxon
 * @param {string} name - Taxonomic name to search for
 * @returns {string|null} - Image URL or null if not found
 */
async function fetchTaxonImage(name) {
    try {
       // const url = `${CONFIG.BASE_API_URL}?taxon_name=${encodeURIComponent(name)}&photos=true`;
        const url = `${CONFIG.WIKIPEDIA_API_URL}${encodeURIComponent(name)}`;
        console.log(`Fetching: ${name}`);

        stats.totalRequests++;
        const response = await fetch(url);

        // Handle rate limiting
        if (response.status === 429) {
            console.log('Rate limited, waiting longer...');
            stats.rateLimitHits++;
            await delay(CONFIG.RATE_LIMIT_DELAY);
            return await fetchTaxonImage(name); // Retry
        }

        if (!response.ok) {
            console.log(`Error fetching ${name}: ${response.status}`);
            stats.failedImages++;
            return null;
        }

        const data = await response.json();

        // Search for the first photo and extract medium_url
       /*  if (data.results && data.results.length > 0) {
            for (const result of data.results) {
                if (result.photos && result.photos.length > 0) {
                    for (const photo of result.photos) {
                        if (photo.url) {
                            // Convert the URL to medium size
                            const mediumUrl = photo.url.replace('square', 'medium');
                            stats.successfulImages++;
                            return mediumUrl;
                        }
                    }
                }
            }
        } */

            let new_data=data;
        if (data.originalimage) // && data.thumbnail.source)
        {
          stats.successfulImages++;
          new_data.wikipedia_image = data.originalimage;
          //   return data.thumbnail.source;
        }
        if (data.extract_html) {
            new_data.wikipedia_html = data.extract_html;
        }

        if (new_data.wikipedia_image && new_data.wikipedia_html) {
            return new_data;
        }
        else
        {
            stats.failedImages++;

        }

        if (!new_data.wikipedia_image && !new_data.wikipedia_html) {
            stats.failedImages++;
            return new_data;
        }

    } catch (error) {
        console.error(`Error fetching ${name}:`, error);
        stats.failedImages++;
        return new_data;
    }
}

/**
 * Recursively process children at all levels and add images
 * @param {Array} children - Array of child taxonomic objects
 * @param {number} level - Current nesting level (for logging)
 * @param {number|null} maxChildren - Maximum children to process (null for unlimited)
 * @returns {Array} - Processed children with images
 */
async function processChildrenRecursively(children, level = 0, maxChildren = null) {
    const processedChildren = [];

    // Limit children if specified (for top level)
    const childrenToProcess = maxChildren ? children.slice(0, maxChildren) : children;

    for (const child of childrenToProcess) {
        const indent = '  '.repeat(level);
        console.log(`${indent}Processing: ${child.name} (${child.level})`);

        // Create a copy of the child object
        const childWithImage = { ...child };

        // Fetch image from API
        //const imageUrl = await fetchTaxonImage(child.name);
        let new_data = await fetchTaxonImage(child.name);
        //childWithImage.wikipedia_image = imageUrl;
        if (!new_data) {
            stats.failedImages++;
            //if no answer from api
        }
        else
        {
        if (new_data.content_urls && new_data.content_urls.desktop && new_data.content_urls.desktop.page) {
            childWithImage.wikipedia_url = new_data.content_urls.desktop.page;
        }
        if (new_data && new_data.wikipedia_image) {
            childWithImage.wikipedia_image = new_data.wikipedia_image;
        }
        else
        {
            if (new_data.originalimage)
            {
                childWithImage.wikipedia_image = new_data.originalimage;
            }
            else
            {
                if (new_data.thumbnail)
                {
                    childWithImage.wikipedia_image = new_data.thumbnail;
                }
                else
                {
                    childWithImage.wikipedia_image = null;
                }

            }
        }
        if (new_data && new_data.wikipedia_html) {
            childWithImage.wikipedia_html = new_data.wikipedia_html;
        }
        else
        {
            childWithImage.wikipedia_html=null;
        }
    }


        // Recursively process nested children if they exist
        if (child.children && child.children.length > 0) {
            childWithImage.children = await processChildrenRecursively(child.children, level + 1);
        }

        processedChildren.push(childWithImage);

        // Add delay between requests to avoid rate limiting
        await delay(CONFIG.API_DELAY);
    }

    return processedChildren;
}

/**
 * Process a specific taxonomic class
 * @param {Object} taxonomicData - Full taxonomic data
 * @param {string} className - Name of the class to process
 * @returns {Object|null} - Processed class data with images or null if not found
 */
async function processClass(taxonomicData, className) {
    const classData = taxonomicData.children.find(child => child.name === className);

    if (!classData) {
        console.log(`Class ${className} not found`);
        return null;
    }

    console.log(`\n=== Processing ${className} ===`);
    console.log(`Processing first ${CONFIG.MAX_TOP_LEVEL_CHILDREN} children and all their nested children`);

    const processedChildren = await processChildrenRecursively(
        classData.children,
        0,
        CONFIG.MAX_TOP_LEVEL_CHILDREN
    );

    return {
        ...classData,
        children: processedChildren
    };
}

/**
 * Count total images in the result tree
 * @param {Object} obj - Object to count images in
 * @returns {number} - Total count of images
 */
function countImages(obj) {
    let count = 0;
    if (obj.wikipedia_image) count++;
    if (obj.children) {
        obj.children.forEach(child => {
            count += countImages(child);
        });
    }
    return count;
}

/**
 * Print summary statistics
 * @param {Object} result - Final result object
 */
function printSummary(result) {
    const totalImages = result.children.reduce((acc, child) => acc + countImages(child), 0);

    console.log('\n=== SUMMARY ===');
    console.log(`Classes processed: ${CONFIG.TARGET_CLASSES.join(', ')}`);
    console.log(`Total API requests: ${stats.totalRequests}`);
    console.log(`Successful images: ${stats.successfulImages}`);
    console.log(`Failed images: ${stats.failedImages}`);
    console.log(`Rate limit hits: ${stats.rateLimitHits}`);
    console.log(`Success rate: ${((stats.successfulImages / stats.totalRequests) * 100).toFixed(1)}%`);
    console.log(`Total images in tree: ${totalImages}`);
    console.log(`Output saved to: ${CONFIG.OUTPUT_FILE}`);
}

/**
 * Main function to orchestrate the entire process
 */
async function main() {
    try {
        console.log('🌳 Taxonomic Tree Image Fetcher');
        console.log('================================');
        console.log(`Input file: ${CONFIG.INPUT_FILE}`);
        console.log(`Output file: ${CONFIG.OUTPUT_FILE}`);
        console.log(`Target classes: ${CONFIG.TARGET_CLASSES.join(', ')}`);
        console.log(`Max children per class: ${CONFIG.MAX_TOP_LEVEL_CHILDREN}`);
        console.log(`API delay: ${CONFIG.API_DELAY}ms\n`);

        // Read the taxonomic tree data
        if (!fs.existsSync(CONFIG.INPUT_FILE)) {
            throw new Error(`Input file not found: ${CONFIG.INPUT_FILE}`);
        }

        const taxonomicData = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf8'));

        // Initialize result structure
        const result = {
            name: taxonomicData.name,
            level: taxonomicData.level,
            count: taxonomicData.count,
            wikipedia_image: null,
            wikipedia_html: null,
            wikipedia_url: null,
            children: [],

        };

        // Process each target class
        for (const className of CONFIG.TARGET_CLASSES) {
            const processedClass = await processClass(taxonomicData, className);
            if (processedClass) {
                result.children.push(processedClass);
            }
        }

        // Write the result to output file
        fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(result, null, 2));

        // Print summary
        printSummary(result);

        console.log('\n✅ Complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

// Export for potential use as a module
export {
    CONFIG,
    fetchTaxonImage,
    processChildrenRecursively,
    processClass,
    main
};
