const csvToJson = require("csvtojson");
const fs = require("fs");
const os = require("os");

const csvPath = "../lib/resources/stations.csv";
const jsonPath = "../lib/resources/stations.json";

// Check if stations.csv exists.
try {
	if (!fs.existsSync(csvPath)) {
		process.stderr.write("CSV file not found.");
		process.stdout.write(os.EOL);
		process.exit();
	}
} catch(err) {
	process.stderr.write(err);
	process.stdout.write(os.EOL);
	process.exit();
}

(async() => {
	try {
		const json = await csvToJson({
			headers: [
				"station",
				"complex",
				"stop",
				"division",
				"line",
				"name",
				"borough",
				"routes",
				"structure",
				"latitude",
				"longitude",
			],
			ignoreColumns: /complex|division|structure/,
		}).fromFile(csvPath);

		// JSON file output, starting with open array.
		let jsonFileOutput = "[";

		// Flag for checking if output JSON file is empty.
		let jsonFileEmpty = true;

		json.forEach((line) => {
			Object.keys(line).forEach((key) => {
				// Convert routes to array.
				if (key == "routes") {
					line[key] = line[key].split(" ");
				}
			});

			// Add comma between lines.
			if (!jsonFileEmpty) {
				jsonFileOutput += ",";
			}

			// Add current line to JSON output.
			jsonFileOutput += JSON.stringify(line, null, 4);

			// JSON file is no longer empty.
			jsonFileEmpty = false;
		});

		// Close array.
		jsonFileOutput += "]";

		// Save JSON file under resources.
		fs.writeFileSync(jsonPath, JSON.stringify(JSON.parse(jsonFileOutput), null, 4));

		// Add empty line at end of JSON file.
		fs.appendFileSync(jsonPath, "\n");
	} catch (err) {
		process.stderr.write(err);
		process.stdout.write(os.EOL);
		process.exit();
	}
})();
