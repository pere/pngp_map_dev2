import fs from "fs";
import path from "path";

//execute from data/scripts folder

// node join_tax_data.js

// Read the simple2.json file
const simple2Data = JSON.parse(fs.readFileSync("./simple2_new.json", "utf8"));

// Read the sp_tax_counts_dbase.js file as text and evaluate it
const spTaxCountsFileContent = fs.readFileSync(
  "./sp_tax_counts_dbase.js",
  "utf8"
);
const spTaxCountsData = eval(spTaxCountsFileContent);

console.log(`Loaded ${simple2Data.length} records from simple2_new.json`);
console.log(
  `Loaded ${spTaxCountsData.length} records from sp_tax_counts_dbase.js`
);

// Create a lookup map for faster joins
const taxCountsMap = new Map();
spTaxCountsData.forEach((item) => {
  taxCountsMap.set(item.tax_id, item);
});

// Join the data
const joinedData = simple2Data.map((item) => {
  // Look for matching tax_id in sp_tax_counts_dbase
  const pngpData = taxCountsMap.get(item.id);

  return {
    ...item,
    pngp_data: pngpData || null,
  };
});

// Count successful joins
const successfulJoins = joinedData.filter(
  (item) => item.pngp_data !== null
).length;
console.log(
  `Successfully joined ${successfulJoins} out of ${joinedData.length} records`
);

// Save the joined data to a new file
const outputPath = "./tax_data_joined_new.json";
fs.writeFileSync(outputPath, JSON.stringify(joinedData, null, 2));

console.log(`✅ Joined data saved to ${outputPath}`);

// Show some statistics
console.log("\nJoin Statistics:");
console.log(`- Total records in simple2_new.json: ${simple2Data.length}`);
console.log(
  `- Total records in sp_tax_counts_dbase_new.js: ${spTaxCountsData.length}`
);
console.log(`- Successful joins: ${successfulJoins}`);
console.log(
  `- Records without PNGP data: ${joinedData.length - successfulJoins}`
);

// Show example of joined record
if (joinedData.length > 0) {
  console.log("\nExample of joined record:");
  console.log(JSON.stringify(joinedData[0], null, 2));
}
