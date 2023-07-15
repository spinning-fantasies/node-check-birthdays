const fs = require('fs');

function convertDateFormat(dateString) {
  const parts = dateString.split('/');
  if (parts.length !== 3) {
    console.error('Invalid date format:', dateString);
    return dateString;
  }

  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  return `${year}-${month}-${day}`;
}

function convertDateFormatInCSV(inputFilePath, outputFilePath) {
  try {
    const inputData = fs.readFileSync(inputFilePath, 'utf8');
    const lines = inputData.split('\n');
    const outputLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line !== '') {
        const parts = line.split(',');
        if (parts.length !== 2) {
          console.error(`Invalid line format in CSV: ${line}`);
          continue;
        }

        const date = parts[0].trim();
        const convertedDate = convertDateFormat(date);

        const outputLine = `${convertedDate},${parts[1]}`;
        outputLines.push(outputLine);
      }
    }

    const outputData = outputLines.join('\n');
    fs.writeFileSync(outputFilePath, outputData, 'utf8');

    console.log(`Conversion complete. Output saved to: ${outputFilePath}`);
  } catch (error) {
    console.error('Error occurred during conversion:', error);
  }
}

// Usage example
const inputFilePath = 'data/dates.csv'; // Provide the path to the input CSV file
const outputFilePath = 'data/clean-dates.csv'; // Provide the path for the output CSV file

convertDateFormatInCSV(inputFilePath, outputFilePath);
