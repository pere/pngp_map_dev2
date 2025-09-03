# Data Processing Scripts

This folder contains utility scripts for processing and converting data files.

## process-species-data.js

Converts CSV species observation data to JSON format for use in the application.

### Usage

To process species data from CSV to JSON:

```bash
npm run process-data
```

### What it does

1. Reads the CSV file: `src/data/v_obs_rangers_eng.csv`
2. Filters and transforms the data according to specified field mappings
3. Converts numeric fields to proper number types
4. Outputs the processed data to: `src/data/paradiso_sp_simple_4326_2.json`

### Input Format

The script expects a pipe-separated CSV file (`|` delimiter) with specific headers including:
- observatio, name_anima, valley_id, areas_surve, date_observ
- altitude, season, year_obser, ranger_nam, english_na
- total_ind, taxonomic_, valley_nam, lat, lng

### Output

Produces a JSON file with cleaned and formatted species observation data that can be consumed by the Svelte application.

### Notes

- This script should only be run when you need to process new CSV data
- It does NOT run automatically when the app starts
- Make sure the input CSV file exists before running the script