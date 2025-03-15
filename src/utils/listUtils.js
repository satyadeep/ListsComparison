// Utility functions for list processing and handling

// Parse input function to handle both numeric and text modes with case sensitivity
export const parseInput = (input, compareMode, caseSensitive) => {
  // Split by commas or newlines
  const rawValues = input.split(/[\n,]+/);

  // Process values based on mode
  return rawValues
    .map((val) => val.trim())
    .filter((val) => val !== "")
    .map((val) => {
      if (compareMode === "numeric") {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      } else {
        // For text mode, handle case sensitivity
        return caseSensitive ? val : val.toLowerCase();
      }
    })
    .filter((val) => val !== null);
};

// Remove duplicates from array with case sensitivity consideration
export const removeDuplicates = (array, compareMode, caseSensitive) => {
  if (compareMode === "numeric" || caseSensitive) {
    return [...new Set(array)];
  } else {
    // For case-insensitive text comparison, use a custom approach
    const seen = new Map();
    return array.filter((item) => {
      const lowercase = String(item).toLowerCase();
      if (seen.has(lowercase)) {
        return false;
      } else {
        seen.set(lowercase, true);
        return true;
      }
    });
  }
};

// Add a new list (up to 5)
export const addList = (lists, nextId, setLists, setNextId) => {
  if (lists.length < 5) {
    setLists([...lists, { id: nextId, content: "" }]);
    setNextId(nextId + 1);
  }
};

// Remove a list
export const removeList = (
  idToRemove,
  lists,
  setLists,
  selectedLists,
  setSelectedLists
) => {
  if (lists.length > 2) {
    setLists(lists.filter((list) => list.id !== idToRemove));
    // Also remove the deleted list ID from selectedLists
    setSelectedLists(selectedLists.filter((id) => id !== idToRemove));
  }
};

// Handle list content change
export const handleListChange = (id, newContent, lists, setLists) => {
  setLists(
    lists.map((list) =>
      list.id === id ? { ...list, content: newContent } : list
    )
  );
};

// Handle select change
export const handleSelectChange = (event, setSelectedLists) => {
  const { value } = event.target;
  setSelectedLists(typeof value === "string" ? value.split(",") : value);
};

// Handle mode change
export const handleModeChange = (event, newMode, setCompareMode) => {
  if (newMode !== null) {
    setCompareMode(newMode);
  }
};

// Handle comparison type change
export const handleComparisonTypeChange = (
  event,
  newType,
  setComparisonType
) => {
  if (newType !== null) {
    setComparisonType(newType);
  }
};

// Improved function to clear all text areas and selections
export const clearAll = (
  lists,
  setLists,
  setSelectedLists,
  setImmediateInputs
) => {
  // Create empty inputs object
  const emptyInputs = {};
  lists.forEach((list) => {
    emptyInputs[list.id] = "";
  });

  // Update immediateInputs first if provided (to update UI immediately)
  if (setImmediateInputs) {
    setImmediateInputs(emptyInputs);
  }

  // Clear all text areas but keep the list structure
  const clearedLists = lists.map((list) => ({ ...list, content: "" }));
  setLists(clearedLists);

  // Clear the multiselect dropdown
  if (setSelectedLists) {
    setSelectedLists([]);
  }

  return clearedLists;
};

// Get count of items in a list
export const getListItemCount = (content, compareMode, caseSensitive) => {
  return parseInput(content, compareMode, caseSensitive).length;
};

// Calculate the number of duplicates in a list
export const getDuplicatesCount = (content, compareMode) => {
  // Split by commas or newlines
  const values = content
    .split(/[\n,]+/)
    .map((val) => val.trim())
    .filter((val) => val !== "");

  // Filter out invalid values based on mode
  const validValues = values.filter((val) => {
    if (compareMode === "numeric") {
      return !isNaN(parseFloat(val));
    }
    return val !== "";
  });

  // Count unique values
  const uniqueCount = new Set(validValues).size;

  // Duplicates = total values - unique values
  return validValues.length - uniqueCount;
};

// Function to sort list content
export const sortListContent = (
  content,
  direction,
  compareMode,
  caseSensitive
) => {
  // Parse the input based on current compare mode
  const values = parseInput(content, compareMode, caseSensitive);

  // Sort the values
  const sortedValues = [...values].sort((a, b) => {
    if (direction === "asc") {
      if (compareMode === "numeric") {
        return a - b;
      } else {
        // For text mode, respect case sensitivity setting
        return caseSensitive
          ? String(a).localeCompare(String(b))
          : String(a).toLowerCase().localeCompare(String(b).toLowerCase());
      }
    } else {
      if (compareMode === "numeric") {
        return b - a;
      } else {
        // For text mode, respect case sensitivity setting
        return caseSensitive
          ? String(b).localeCompare(String(a))
          : String(b).toLowerCase().localeCompare(String(a).toLowerCase());
      }
    }
  });

  // Join the values back with newlines
  return sortedValues.join("\n");
};

// Handle sorting a specific list
export const handleSort = (
  listId,
  direction,
  lists,
  compareMode,
  caseSensitive,
  setLists
) => {
  const list = lists.find((list) => list.id === listId);
  if (list) {
    const sortedContent = sortListContent(
      list.content,
      direction,
      compareMode,
      caseSensitive
    );
    handleListChange(listId, sortedContent, lists, setLists);
  }
};

// Sort result items
export const sortResultItems = (
  listId,
  direction,
  resultsSorting,
  setResultsSorting
) => {
  // Update sorting state
  setResultsSorting({
    ...resultsSorting,
    [listId]: direction,
  });
};

// Get sorted items for a result list
export const getSortedItems = (
  items,
  listId,
  resultsSorting,
  compareMode,
  caseSensitive
) => {
  const direction = resultsSorting[listId];

  if (!direction) return items; // No sorting applied

  return [...items].sort((a, b) => {
    if (direction === "asc") {
      if (compareMode === "numeric") {
        return a - b;
      } else {
        return caseSensitive
          ? String(a).localeCompare(String(b))
          : String(a).toLowerCase().localeCompare(String(b).toLowerCase());
      }
    } else {
      if (compareMode === "numeric") {
        return b - a;
      } else {
        return caseSensitive
          ? String(b).localeCompare(String(a))
          : String(b).toLowerCase().localeCompare(String(a).toLowerCase());
      }
    }
  });
};

// Handle case sensitivity toggle
export const handleCaseSensitivityChange = (event, setCaseSensitive) => {
  setCaseSensitive(event.target.checked);
};

// Handle trimming spaces in a list
export const handleTrimSpaces = (listId, lists, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            content: list.content
              .split(/[,\n]+/)
              .map((item) => item.trim())
              .join("\n"),
          }
        : list
    )
  );
};

// Handle clearing a specific list's content
export const handleClearList = (listId, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId ? { ...list, content: "" } : list
    )
  );
};

// Text case transformation functions
export const convertToUppercase = (listId, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            content: list.content.toUpperCase(),
          }
        : list
    )
  );
};

export const convertToLowercase = (listId, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            content: list.content.toLowerCase(),
          }
        : list
    )
  );
};

export const convertToCamelCase = (listId, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            content: list.content
              .split(/\n+/)
              .map((line) => {
                // Preserve spaces in the line, apply camelCase to individual words
                return line.replace(/\b\w+\b/g, (word, index, fullLine) => {
                  // Check if this is the first word in the line
                  const precedingText = fullLine.substring(
                    0,
                    fullLine.indexOf(word)
                  );
                  const isFirstWord = !precedingText.trim();

                  if (isFirstWord) {
                    return word.toLowerCase();
                  } else {
                    return (
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    );
                  }
                });
              })
              .join("\n"),
          }
        : list
    )
  );
};

export const convertToPascalCase = (listId, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            content: list.content
              .split(/\n+/)
              .map((line) => {
                // Preserve spaces in the line, apply PascalCase to individual words
                return line.replace(/\b\w+\b/g, (word) => {
                  return (
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  );
                });
              })
              .join("\n"),
          }
        : list
    )
  );
};

export const convertToSentenceCase = (listId, setLists) => {
  setLists((prevLists) =>
    prevLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            content: list.content
              .split(/\n+/)
              .map((line) => {
                if (line.trim() === "") return line;
                return (
                  line.charAt(0).toUpperCase() + line.slice(1).toLowerCase()
                );
              })
              .join("\n"),
          }
        : list
    )
  );
};

// Transformation functions for the common selected results
export const transformCommonToUppercase = (
  commonSelected,
  setCommonSelected
) => {
  setCommonSelected(commonSelected.map((item) => String(item).toUpperCase()));
};

export const transformCommonToLowercase = (
  commonSelected,
  setCommonSelected
) => {
  setCommonSelected(commonSelected.map((item) => String(item).toLowerCase()));
};

export const transformCommonToSentenceCase = (
  commonSelected,
  setCommonSelected
) => {
  setCommonSelected(
    commonSelected.map((item) => {
      const str = String(item);
      if (str.trim() === "") return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    })
  );
};

export const transformCommonToCamelCase = (
  commonSelected,
  setCommonSelected
) => {
  setCommonSelected(
    commonSelected.map((item) => {
      const str = String(item);
      return str.replace(/\b\w+\b/g, (word, index, fullLine) => {
        const precedingText = fullLine.substring(0, fullLine.indexOf(word));
        const isFirstWord = !precedingText.trim();

        if (isFirstWord) {
          return word.toLowerCase();
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
      });
    })
  );
};

export const transformCommonToPascalCase = (
  commonSelected,
  setCommonSelected
) => {
  setCommonSelected(
    commonSelected.map((item) => {
      const str = String(item);
      return str.replace(/\b\w+\b/g, (word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
    })
  );
};

// Function to copy content to clipboard
export const copyToClipboard = (content) => {
  if (typeof content === "object" && Array.isArray(content)) {
    // If content is an array, join it with newlines
    navigator.clipboard
      .writeText(content.join("\n"))
      .then(() => {
        console.log("Content copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  } else if (typeof content === "string") {
    // If content is already a string
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("Content copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }
};

// Function that combines trimming spaces and removing duplicates
export const trimAndRemoveDuplicates = (
  listId,
  lists,
  setLists,
  compareMode,
  caseSensitive
) => {
  // First trim spaces
  handleTrimSpaces(listId, lists, setLists);

  // Then find the list with updated trimmed content and remove duplicates
  const listIndex = lists.findIndex((l) => l.id === listId);
  if (listIndex !== -1) {
    const trimmedContent = parseInput(
      lists[listIndex].content,
      compareMode,
      caseSensitive
    );
    const uniqueContent = removeDuplicates(
      trimmedContent,
      compareMode,
      caseSensitive
    );
    handleListChange(listId, uniqueContent.join("\n"), lists, setLists);
  }
};

// Define background colors for lists in light mode
export const listColorsBg = [
  "#f0f8ff", // AliceBlue
  "#f5f5dc", // Beige
  "#e6e6fa", // Lavender
  "#FBF9F1", // HoneyDew
  "#fff0f5", // LavenderBlush
];

// Define border colors for lists
export const listBorderColorsBg = [
  "#295F98", // AliceBlue
  "#A28B55", // Beige
  "#624E88", // Lavender
  "#867070", // HoneyDew
  "#C96868", // LavenderBlush
];

// Define background colors for lists in dark mode
export const listColorsBgDark = [
  "#0b2744", // Dark AliceBlue
  "#3a3424", // Dark Beige
  "#27203d", // Dark Lavender
  "#302a2a", // Dark HoneyDew
  "#3d1a22", // Dark LavenderBlush
];

// Get color for a list based on its ID or index and the specified color palette
export const getListColor = (
  listId,
  lists,
  colorPaletteType = "background",
  isDarkMode = false
) => {
  // Find the index of the list in the array
  const index = lists.findIndex((list) => list.id === listId);

  // Select the appropriate color array based on the colorPaletteType
  let colorArray;
  if (colorPaletteType === "border") {
    colorArray = listBorderColorsBg;
  } else {
    // For background, check if dark mode
    colorArray = isDarkMode ? listColorsBgDark : listColorsBg;
  }

  // If list is found, return the corresponding color from the array
  // Use modulo to cycle through colors if there are more lists than colors
  if (index !== -1) {
    return colorArray[index % colorArray.length];
  }

  // Default color if list not found
  if (isDarkMode) {
    return colorPaletteType === "border" ? "#555555" : "#1e1e1e";
  } else {
    return colorPaletteType === "border" ? "#cccccc" : "#ffffff";
  }
};

// Compare all lists and get unique values for each list and common values
export const compareAllLists = (lists, compareMode, caseSensitive) => {
  const parsedLists = lists.map((list) => ({
    id: list.id,
    values: removeDuplicates(
      parseInput(list.content, compareMode, caseSensitive),
      compareMode,
      caseSensitive
    ),
  }));

  // Calculate results for each list and common values
  const results = [];

  // Find unique values for each list
  parsedLists.forEach((currentList) => {
    const otherListsValues = new Set(
      parsedLists
        .filter((list) => list.id !== currentList.id)
        .flatMap((list) => list.values)
    );

    const uniqueValues = currentList.values.filter((value) => {
      if (compareMode === "text" && !caseSensitive) {
        // Case-insensitive comparison for text
        return ![...otherListsValues].some(
          (otherValue) =>
            String(value).toLowerCase() === String(otherValue).toLowerCase()
        );
      }
      return !otherListsValues.has(value);
    });

    results.push({
      listId: currentList.id,
      uniqueValues,
    });
  });

  // Find common values across all lists
  let commonValues = [];
  if (parsedLists.length > 0 && parsedLists[0].values.length > 0) {
    commonValues = parsedLists[0].values.filter((value) =>
      parsedLists.every((list) => {
        if (compareMode === "text" && !caseSensitive) {
          // Case-insensitive comparison for text
          return list.values.some(
            (listValue) =>
              String(value).toLowerCase() === String(listValue).toLowerCase()
          );
        }
        return list.values.includes(value);
      })
    );
  }

  results.push({
    listId: "common",
    uniqueValues: commonValues,
  });

  return results;
};

// Calculate values that are common among selected lists (intersection) or all unique values (union)
export const compareSelectedLists = (
  lists,
  selectedLists,
  compareMode,
  caseSensitive,
  comparisonType
) => {
  if (selectedLists.length < 2) {
    return [];
  }

  const selectedParsedLists = selectedLists.map((id) => {
    const list = lists.find((list) => list.id === id);
    return {
      id,
      values: removeDuplicates(
        parseInput(list?.content || "", compareMode, caseSensitive),
        compareMode,
        caseSensitive
      ),
    };
  });

  if (selectedParsedLists.length > 0) {
    if (comparisonType === "intersection") {
      // Find common values (intersection)
      return selectedParsedLists[0].values.filter((value) =>
        selectedParsedLists.every((list) => {
          if (compareMode === "text" && !caseSensitive) {
            // Case-insensitive comparison for text
            return list.values.some(
              (listValue) =>
                String(value).toLowerCase() === String(listValue).toLowerCase()
            );
          }
          return list.values.includes(value);
        })
      );
    } else {
      // Find all unique values (union)
      return removeDuplicates(
        selectedParsedLists.flatMap((list) => list.values),
        compareMode,
        caseSensitive
      );
    }
  }

  return [];
};

/**
 * Enhanced parse function for imported files that handles categories
 * @param {string} content - The content to parse
 * @returns {Object} Object containing lists and categories
 */
export const parseExportedFormatWithCategories = (content) => {
  const lists = [];
  const categories = new Set(["Default"]);
  let nextId = 1;

  // Try to extract JSON metadata if available
  if (content.includes("LISTS_COMPARISON_METADATA:")) {
    const metadataMatch = content.match(
      /LISTS_COMPARISON_METADATA:(.*?)END_METADATA/s
    );
    if (metadataMatch && metadataMatch[1]) {
      try {
        const metadata = JSON.parse(metadataMatch[1].trim());
        if (metadata.lists && Array.isArray(metadata.lists)) {
          // Use metadata directly - this is the most reliable method
          return {
            lists: metadata.lists,
            categories: metadata.categories || ["Default"],
          };
        }
      } catch (e) {
        console.error("Failed to parse metadata JSON:", e);
      }
    }
  }

  // Legacy format parsing with category support
  const sections = content.split(/---\s*(?=(?:[^-]|-[^-]))/);

  for (const section of sections) {
    if (!section.trim()) continue;

    // Try to extract list name/number and content
    const match = section.match(/([^-\n]*)\s*---\s*\n([\s\S]*?)(?=$)/);
    if (match) {
      const [, header, listContent] = match;
      const trimmedHeader = header.trim();

      // Skip if it's the Results section
      if (trimmedHeader.toLowerCase() === "results") continue;

      let listName = trimmedHeader;
      let category = "Default";

      // Check if the header contains category information
      if (trimmedHeader.includes("[") && trimmedHeader.includes("]")) {
        const categoryMatch = trimmedHeader.match(/\[([^\]]+)\]/);
        if (categoryMatch) {
          category = categoryMatch[1].trim();
          listName = trimmedHeader.replace(/\[([^\]]+)\]/, "").trim();
          categories.add(category);
        }
      }

      // Extract list number if the format is "List X"
      let listNumber = null;
      const numberMatch = listName.match(/List\s+(\d+)/i);
      if (numberMatch) {
        listNumber = parseInt(numberMatch[1], 10);
      }

      // Add the list
      lists.push({
        id: nextId++,
        name: listName,
        content: listContent.trim(),
        category,
      });
    }
  }

  return {
    lists,
    categories: Array.from(categories),
  };
};

// Keep the original parseExportedFormat for backward compatibility
export const parseExportedFormat = (content) => {
  const listContents = [];
  const listPattern =
    /---\s*List\s+(\d+)\s*---\n([\s\S]*?)(?=---\s*(?:List|Results)|$)/g;
  let match;

  while ((match = listPattern.exec(content)) !== null) {
    const listNumber = parseInt(match[1], 10);
    const listContent = match[2].trim();

    // Store content by list number (1-based index for display, 0-based for array)
    listContents[listNumber - 1] = listContent;
  }

  return listContents;
};

/**
 * Delete a category and move its lists to Default
 * @param {string} categoryToDelete - The category to delete
 * @param {Array} lists - Current lists array
 * @param {Function} setLists - Function to update lists
 * @param {Array} categories - Current categories array
 * @param {Function} setCategories - Function to update categories
 */
export const deleteCategory = (
  categoryToDelete,
  lists,
  setLists,
  categories,
  setCategories
) => {
  // Cannot delete the Default category
  if (categoryToDelete === "Default") {
    return;
  }

  // Update lists to move them to Default category
  const updatedLists = lists.map((list) =>
    list.category === categoryToDelete ? { ...list, category: "Default" } : list
  );
  setLists(updatedLists);

  // Remove the category from the categories list
  const updatedCategories = categories.filter(
    (category) => category !== categoryToDelete
  );
  setCategories(updatedCategories);

  return { updatedLists, updatedCategories };
};
