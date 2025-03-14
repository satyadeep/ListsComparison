import { useCallback } from "react";
import { parseExportedFormat } from "../utils/listUtils";

/**
 * Custom hook for handling import and export functionality
 */
export function useImportExport(
  lists,
  setLists,
  setImmediateInputs,
  setNotification
) {
  // Import data from file content
  const importData = useCallback(
    (content) => {
      try {
        // Check if this is a file in our export format (contains list headers)
        if (
          content.includes("--- List 1 ---") ||
          content.includes("--- List")
        ) {
          // Parse the exported format
          const listContents = parseExportedFormat(content);

          // Update existing lists with parsed content
          const updatedLists = [...lists];
          listContents.forEach((content, index) => {
            if (index < updatedLists.length && content) {
              updatedLists[index] = {
                ...updatedLists[index],
                content: content,
              };
            }
          });

          setLists(updatedLists);

          // Update immediateInputs
          const newInputs = {};
          updatedLists.forEach((list) => {
            newInputs[list.id] = list.content;
          });
          setImmediateInputs(newInputs);

          setNotification({
            open: true,
            message: "File imported and parsed successfully",
            severity: "success",
          });
        } else {
          // Basic import - assumes the file contains list items separated by new lines
          // This goes to the first list by default
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
              message: "Data imported successfully",
              severity: "success",
            });
          }
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
    [lists, setLists, setImmediateInputs, setNotification]
  );

  // Export data to a file
  const exportData = useCallback(
    (results) => {
      try {
        // Create text content with all list data using actual list names
        let exportData = lists
          .map(
            (list, index) =>
              `--- ${list.name || `List ${index + 1}`} ---\n${list.content}`
          )
          .join("\n\n");

        // Add the results section if results are provided
        if (results && results.length > 0) {
          exportData += "\n\n--- Results ---\n";
          results.forEach((result) => {
            if (result.listId === "common") {
              exportData += `Common to All Lists (${
                result.uniqueValues.length
              } items):\n${result.uniqueValues.join("\n")}\n\n`;
            } else {
              const list = lists.find((list) => list.id === result.listId);
              const listName = list?.name || `Unknown List`;

              exportData += `Unique to ${listName} (${
                result.uniqueValues.length
              } items):\n${result.uniqueValues.join("\n")}\n\n`;
            }
          });
        }

        // Create a blob and trigger download
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
    [lists, setNotification]
  );

  return {
    importData,
    exportData,
  };
}
