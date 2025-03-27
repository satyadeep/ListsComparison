import * as XLSX from "xlsx";

/**
 * Export lists and results to Excel format
 * @param {Array} lists - The lists to export
 * @param {Array} results - The comparison results
 * @param {Array} commonSelected - The custom comparison results
 * @param {string} comparisonType - The type of custom comparison (intersection/union)
 * @param {Array} selectedLists - IDs of lists selected for custom comparison
 */
export const exportToExcel = async (
  lists,
  results,
  commonSelected,
  comparisonType,
  selectedLists
) => {
  try {
    // Import the necessary functions to calculate both intersection and union
    const { compareSelectedLists } = await import("./listUtils");

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // 1. Add input lists sheet
    const inputData = [];
    const headers = [];
    const maxRows = Math.max(
      ...lists.map((list) => {
        const items = list.content
          ? list.content
              .split(/[\n,]+/)
              .map((i) => i.trim())
              .filter((i) => i)
          : [];
        return items.length;
      }),
      0
    );

    // Create headers from list names
    lists.forEach((list) => {
      headers.push(list.name || `List ${list.id}`);
    });
    inputData.push(headers);

    // Fill data rows
    for (let i = 0; i < maxRows; i++) {
      const row = [];
      lists.forEach((list) => {
        const items = list.content
          ? list.content
              .split(/[\n,]+/)
              .map((i) => i.trim())
              .filter((i) => i)
          : [];
        row.push(items[i] || "");
      });
      inputData.push(row);
    }

    // Add the input lists worksheet
    const inputSheet = XLSX.utils.aoa_to_sheet(inputData);
    XLSX.utils.book_append_sheet(workbook, inputSheet, "Input Lists");

    // 2. Add comparison results sheets
    if (results && results.length > 0) {
      // Group results data
      const uniqueResults = results.filter(
        (result) => result.listId !== "common"
      );
      const commonResult = results.find((result) => result.listId === "common");

      // Add unique values worksheets
      uniqueResults.forEach((result) => {
        const list = lists.find((l) => l.id === result.listId);
        const listName = list
          ? list.name || `List ${list.id}`
          : `List ${result.listId}`;
        const sheetName = `Unique to ${listName}`.substring(0, 31); // Excel sheet name length limit

        const data = [["Unique Values"]];
        result.uniqueValues.forEach((value) => {
          data.push([value]);
        });

        const sheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
      });

      // Add common values worksheet
      if (commonResult && commonResult.uniqueValues.length > 0) {
        const data = [["Common Values"]];
        commonResult.uniqueValues.forEach((value) => {
          data.push([value]);
        });

        const sheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, sheet, "Common Values");
      }
    }

    // 3. Add both intersection and union sheets regardless of selected mode
    if (selectedLists && selectedLists.length >= 2) {
      // Get the names of the selected lists
      const selectedListNames = selectedLists
        .map((id) => {
          const list = lists.find((l) => l.id === id);
          return list ? list.name || `List ${id}` : `List ${id}`;
        })
        .join(" - ");

      // Calculate intersection
      const intersectionValues = compareSelectedLists(
        lists,
        selectedLists,
        "text", // Use text mode for the calculations
        false, // Case insensitive
        "intersection"
      );

      // Calculate union
      const unionValues = compareSelectedLists(
        lists,
        selectedLists,
        "text",
        false,
        "union"
      );

      // Add intersection worksheet
      const intersectionHeader = `${selectedListNames} (∩)`;
      const intersectionData = [[intersectionHeader]];
      intersectionValues.forEach((value) => {
        intersectionData.push([value]);
      });

      const intersectionSheet = XLSX.utils.aoa_to_sheet(intersectionData);
      XLSX.utils.book_append_sheet(workbook, intersectionSheet, "Intersection");

      // Add union worksheet
      const unionHeader = `${selectedListNames} (∪)`;
      const unionData = [[unionHeader]];
      unionValues.forEach((value) => {
        unionData.push([value]);
      });

      const unionSheet = XLSX.utils.aoa_to_sheet(unionData);
      XLSX.utils.book_append_sheet(workbook, unionSheet, "Union");
    }

    // Write the workbook and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Generate filename with date
    const fileName = `list-comparison-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);

    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    alert(`Failed to export to Excel: ${error.message}`);
    return false;
  }
};

/**
 * Exports data to an Excel file with the given filename
 * @param {Array} data - Array of objects representing rows of data
 * @param {string} filename - Name for the Excel file (without extension)
 */
export const exportDataToExcel = (data, filename) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate Excel file
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return false;
  }
};
