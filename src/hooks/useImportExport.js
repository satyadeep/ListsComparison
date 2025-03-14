import { useCallback } from "react";
import { parseExportedFormatWithCategories } from "../utils/listUtils";

/**
 * Custom hook for handling import and export functionality
 */
export function useImportExport(
  lists,
  setLists,
  setImmediateInputs,
  setNotification,
  categories,
  setCategories
) {
  // Import data from file content
  const importData = useCallback(
    (content) => {
      try {
        console.log("Starting import process...");

        // Try using the enhanced parser that handles categories
        const { lists: parsedLists, categories: parsedCategories } =
          parseExportedFormatWithCategories(content);

        if (parsedLists && parsedLists.length > 0) {
          console.log("Successfully parsed imported file:", parsedLists);
          console.log("Extracted categories:", parsedCategories);

          // Fix IDs to ensure they're unique and numeric
          const fixedLists = parsedLists.map((list, index) => ({
            ...list,
            id: typeof list.id === "number" ? list.id : index + 1,
            category: list.category || "Default",
          }));

          // Update lists state
          setLists(fixedLists);

          // Update categories state
          if (parsedCategories && parsedCategories.length > 0) {
            setCategories(parsedCategories);
          }

          // Update immediateInputs
          const newInputs = {};
          fixedLists.forEach((list) => {
            newInputs[list.id] = list.content || "";
          });
          setImmediateInputs(newInputs);

          setNotification({
            open: true,
            message: `File imported successfully with ${fixedLists.length} lists`,
            severity: "success",
          });
          return;
        }

        // If parsing fails or no lists found, fall back to simple text import
        console.log("Falling back to simple text import");
        if (lists.length > 0) {
          const newLists = [...lists];
          newLists[0] = { ...newLists[0], content: content.trim() };
          setLists(newLists);

          // Update immediateInputs
          setImmediateInputs((prev) => ({
            ...prev,
            [newLists[0].id]: content.trim(),
          }));

          setNotification({
            open: true,
            message: "Data imported as plain text",
            severity: "success",
          });
        }
      } catch (error) {
        console.error("Import error:", error);
        setNotification({
          open: true,
          message: "Failed to import data: " + error.message,
          severity: "error",
        });
      }
    },
    [lists, setLists, setImmediateInputs, setNotification, setCategories]
  );

  // Export data to a file
  const exportData = useCallback(
    (results) => {
      try {
        console.log("Starting export process...");
        console.log("Lists to export:", lists);
        console.log("Categories:", categories);

        // Create metadata section with full list objects
        let metadata = {
          lists: lists.map((list) => ({
            id: list.id,
            name: list.name || `List ${list.id}`,
            content: list.content || "",
            category: list.category || "Default",
          })),
          categories: categories || ["Default"],
          version: "1.2.0",
        };

        let exportData = `LISTS_COMPARISON_METADATA:${JSON.stringify(
          metadata,
          null,
          2
        )}END_METADATA\n\n`;

        // Add human-readable list sections
        lists.forEach((list) => {
          const category = list.category || "Default";
          const categoryTag = category !== "Default" ? ` [${category}]` : "";
          exportData += `--- ${
            list.name || `List ${list.id}`
          }${categoryTag} ---\n${list.content || ""}\n\n`;
        });

        // Add the results section if results are provided
        if (results && results.length > 0) {
          exportData += "--- Results ---\n";
          results.forEach((result) => {
            if (result.listId === "common") {
              exportData += `Common to All Lists (${
                result.uniqueValues.length
              } items):\n${result.uniqueValues.join("\n")}\n\n`;
            } else {
              // Find the list name for this result
              const list = lists.find((list) => list.id === result.listId);
              const listName = list?.name || `List ${result.listId}`;

              exportData += `Unique to ${listName} (${
                result.uniqueValues.length
              } items):\n${result.uniqueValues.join("\n")}\n\n`;
            }
          });
        }

        // Create a blob and download it
        const blob = new Blob([exportData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `list-comparison-export-${new Date()
          .toISOString()
          .slice(0, 10)}.txt`;
        link.click();
        URL.revokeObjectURL(url);

        setNotification({
          open: true,
          message: "Data exported successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Export error:", error);
        setNotification({
          open: true,
          message: "Failed to export data",
          severity: "error",
        });
      }
    },
    [lists, categories, setNotification]
  );

  return {
    importData,
    exportData,
  };
}
