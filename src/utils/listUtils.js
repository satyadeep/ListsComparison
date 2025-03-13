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

// Add function to clear all text areas and selections
export const clearAll = (lists, setLists, setSelectedLists) => {
  // Clear all text areas but keep the list structure
  const clearedLists = lists.map((list) => ({ ...list, content: "" }));
  setLists(clearedLists);
  // Clear the multiselect dropdown
  setSelectedLists([]);
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
