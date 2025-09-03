import fs from "fs";
import * as aq from "arquero";
import csv from "csv-parser";
import { op } from "arquero";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to process species data
export async function processSpeciesData() {
  const results = [];

  const headers = [
    "observatio",
    "name_anima",
    "areas_surv",
    "valley_id",
    "areas_loca",
    "notes_coor",
    "date_obser",
    "time_obser",
    "year_obser",
    "season",
    "timestamp_",
    "altitude",
    "altitude_g",
    "s_daily",
    "s_weekly",
    "sign_code_",
    "sign_cod_1",
    "notes",
    "male",
    "female",
    "young",
    "kid",
    "total_ind",
    "data_quali",
    "data_qua_1",
    "file_sourc",
    "area_surve",
    "taxonomic_",
    "english_na",
    "ranger_nam",
    "valley_nam",
    "lat",
    "lng",
  ];

  const fieldsToInclude = [
    "observatio",
    "name_anima",
    "valley_id",
    "areas_surve",
    "date_observ",
    "altitude",
    "season",
    "year_obser",
    "ranger_nam",
    "english_na",
    "total_ind",
    "taxonomic_",
    "valley_nam",
    "lat",
    "lng",
  ];

  // Define which fields should be numeric
  const numericFields = [
    "observatio",
    "valley_id",
    "altitude",
    "year_obser",
    "total_ind",
    "lat",
    "lng",
  ];

  return new Promise((resolve, reject) => {
    let rowCount = 0;
    const inputPath = path.join(__dirname, "../src/data/v_obs_rangers_eng.csv");
    const outputPath = path.join(
      __dirname,
      "../src/data/paradiso_sp_simple_4326_2.json"
    );

    if (!fs.existsSync(inputPath)) {
      reject(new Error(`Input file not found: ${inputPath}`));
      return;
    }

    fs.createReadStream(inputPath)
      .pipe(
        csv({
          separator: "|",
          headers: headers,
        })
      )
      .on("data", (data) => {
        rowCount++;
        console.log(`Processing row ${rowCount}:`, Object.keys(data));

        // Skip the first row if it contains headers
        if (rowCount === 1 && data[headers[0]] === headers[0]) {
          console.log("Skipping header row");
          return;
        }

        const filteredData = {};
        fieldsToInclude.forEach((field) => {
          if (data[field] !== undefined && data[field] !== "") {
            let value = data[field];

            // Convert numeric fields to numbers
            if (numericFields.includes(field)) {
              const numValue = Number(value);
              // Only convert if it's a valid number, otherwise keep original value
              if (!isNaN(numValue) && value !== "") {
                value = numValue;
              }
            }

            filteredData[field] = value;
          }
        });

        if (Object.keys(filteredData).length > 0) {
          results.push(filteredData);
        }
      })
      .on("end", () => {
        console.log(`Total rows processed: ${rowCount}`);
        console.log(`Valid data entries: ${results.length}`);

        const json = JSON.stringify(results, null, 2);
        fs.writeFile(outputPath, json, (err) => {
          if (err) {
            console.error("Error writing file:", err);
            reject(err);
          } else {
            console.log("Data converted and saved successfully!");
            if (results.length > 0) {
              try {
                const table = aq.from(results);
                console.log("Sample data:", table.slice(0, 3).objects());
                resolve({
                  message: "Processing completed successfully",
                  totalRows: rowCount,
                  validEntries: results.length,
                  outputFile: outputPath,
                });
              } catch (error) {
                console.error("Error processing with Arquero:", error);
                reject(error);
              }
            } else {
              console.log("No valid data to process.");
              resolve({
                message: "No valid data found",
                totalRows: rowCount,
                validEntries: 0,
              });
            }
          }
        });
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error);
        reject(error);
      });
  });
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processSpeciesData()
    .then((result) => {
      console.log("Success:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
