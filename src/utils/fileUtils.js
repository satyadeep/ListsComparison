/**
 * Utility functions for importing and exporting files in various formats
 */
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";

// ------------------ IMPORT FUNCTIONS ------------------

/**
 * Read a file and return its contents based on file type
 * @param {File} file - The file to read
 * @returns {Promise} - Promise resolving to the file contents
 */
export const readFile = async (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        const fileType = getFileType(file.name);
        switch (fileType) {
          case "csv":
            parseCsvFile(e.target.result, resolve);
            break;
          case "json":
            parseJsonFile(e.target.result, resolve);
            break;
          case "excel":
            parseExcelFile(e.target.result, resolve);
            break;
          default:
            // Treat as plain text
            resolve(e.target.result);
        }
      } catch (error) {
        reject(error);
      }
    };

    fileReader.onerror = (error) => reject(error);

    // Read the file based on type
    if (getFileType(file.name) === "excel") {
      fileReader.readAsArrayBuffer(file);
    } else {
      fileReader.readAsText(file);
    }
  });
};

/**
 * Determine file type based on extension
 * @param {string} filename - Name of the file
 * @returns {string} - Type of the file
 */
const getFileType = (filename) => {
  const extension = filename.split(".").pop().toLowerCase();
  if (["csv"].includes(extension)) return "csv";
  if (["json"].includes(extension)) return "json";
  if (["xlsx", "xls"].includes(extension)) return "excel";
  return "text";
};

/**
 * Parse CSV file contents
 * @param {string} content - The CSV file content
 * @param {Function} resolve - Resolve function from the Promise
 */
const parseCsvFile = (content, resolve) => {
  Papa.parse(content, {
    complete: (results) => {
      // Filter out empty rows and join with newlines
      const processedData = results.data
        .map((row) => row.filter((cell) => cell.trim() !== "").join("\n"))
        .filter((row) => row !== "")
        .join("\n");
      resolve(processedData);
    },
    error: (error) => {
      throw new Error(`Error parsing CSV: ${error}`);
    },
  });
};

/**
 * Parse JSON file contents
 * @param {string} content - The JSON file content
 * @param {Function} resolve - Resolve function from the Promise
 */
const parseJsonFile = (content, resolve) => {
  try {
    const data = JSON.parse(content);

    // Handle various formats
    if (Array.isArray(data)) {
      // If it's an array, join elements with newlines
      resolve(data.join("\n"));
    } else if (typeof data === "object") {
      // If it's an object, extract values and join with newlines
      const values = Object.values(data)
        .flat()
        .filter((item) => item !== null && item !== undefined);
      resolve(values.join("\n"));
    } else {
      // Fallback for other formats
      resolve(content);
    }
  } catch (error) {
    throw new Error(`Error parsing JSON: ${error}`);
  }
};

/**
 * Parse Excel file contents
 * @param {ArrayBuffer} content - The Excel file content as ArrayBuffer
 * @param {Function} resolve - Resolve function from the Promise
 */
const parseExcelFile = (content, resolve) => {
  try {
    // Parse Excel file
    const workbook = XLSX.read(content, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert sheet to array of arrays
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    // Process data and convert to string
    const processedData = data
      .map((row) =>
        row
          .filter((cell) => cell !== null && cell !== undefined && cell !== "")
          .join("\n")
      )
      .filter((row) => row !== "")
      .join("\n");

    resolve(processedData);
  } catch (error) {
    throw new Error(`Error parsing Excel: ${error}`);
  }
};

// ------------------ EXPORT FUNCTIONS ------------------

/**
 * Export data to CSV format
 * @param {Array} data - The data to export
 * @param {string} filename - Name for the exported file
 */
export const exportToCSV = (data, filename = "export.csv") => {
  // Convert data to CSV format
  const csvContent = Papa.unparse({
    fields: ["Value"],
    data: data.map((item) => [item]),
  });

  // Create a blob and save the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

/**
 * Export data to JSON format
 * @param {Array} data - The data to export
 * @param {string} filename - Name for the exported file
 */
export const exportToJSON = (data, filename = "export.json") => {
  // Convert data to JSON string
  const jsonContent = JSON.stringify(data, null, 2);

  // Create a blob and save the file
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  saveAs(blob, filename);
};

/**
 * Export data to Excel format
 * @param {Array} data - The data to export
 * @param {string} filename - Name for the exported file
 */
export const exportToExcel = (data, filename = "export.xlsx") => {
  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(data.map((item) => [item]));

  // Create a workbook with the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Generate and save the Excel file
  XLSX.writeFile(wb, filename);
};

/**
 * Export data in plain text format
 * @param {Array} data - The data to export
 * @param {string} filename - Name for the exported file
 */
export const exportToText = (data, filename = "export.txt") => {
  // Convert data to text with line breaks
  const textContent = data.join("\n");

  // Create a blob and save the file
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
  saveAs(blob, filename);
};

/**
 * Export data in the specified format
 * @param {Array} data - The data to export
 * @param {string} format - The export format ('csv', 'json', 'excel', 'text')
 * @param {string} filename - Base name for the exported file
 */
export const exportData = (data, format, filename = "export") => {
  switch (format.toLowerCase()) {
    case "csv":
      exportToCSV(data, `${filename}.csv`);
      break;
    case "json":
      exportToJSON(data, `${filename}.json`);
      break;
    case "excel":
      exportToExcel(data, `${filename}.xlsx`);
      break;
    case "text":
    default:
      exportToText(data, `${filename}.txt`);
  }
};
