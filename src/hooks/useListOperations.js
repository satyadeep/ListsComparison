import { useState, useCallback, useEffect } from "react";
import {
  parseInput,
  removeDuplicates,
  sortListContent,
  convertToUppercase,
  convertToLowercase,
  convertToSentenceCase,
  convertToCamelCase,
  convertToPascalCase,
} from "../utils/listUtils";

/**
 * Custom hook for managing list operations
 */
export function useListOperations(initialLists = []) {
  const [lists, setLists] = useState(
    initialLists.length > 0
      ? initialLists
      : [
          { id: 1, name: "List 1", content: "", category: "Default" },
          { id: 2, name: "List 2", content: "", category: "Default" },
        ]
  );
  const [nextId, setNextId] = useState(() => {
    const maxId = initialLists.reduce((max, list) => Math.max(max, list.id), 0);
    return maxId + 1 || 3;
  });
  const [categories, setCategories] = useState(() => {
    const uniqueCategories = new Set(
      initialLists.map((list) => list.category || "Default")
    );
    return Array.from(uniqueCategories).length > 0
      ? Array.from(uniqueCategories)
      : ["Default"];
  });
  const [immediateInputs, setImmediateInputs] = useState({});

  // Initialize immediateInputs with the contents from lists
  useEffect(() => {
    const initialInputs = {};
    lists.forEach((list) => {
      initialInputs[list.id] = list.content;
    });
    setImmediateInputs(initialInputs);
  }, []);

  // Add a new list
  const addList = useCallback(
    (category = "Default") => {
      if (lists.length < 5) {
        const defaultName = `List ${lists.length + 1}`;
        setLists((prevLists) => [
          ...prevLists,
          { id: nextId, name: defaultName, content: "", category },
        ]);
        setNextId((prevId) => prevId + 1);
      }
    },
    [lists.length, nextId]
  );

  // Remove a list
  const removeList = useCallback(
    (listId, selectedLists, setSelectedLists) => {
      if (lists.length > 2) {
        setLists((prevLists) => prevLists.filter((list) => list.id !== listId));

        // Also remove from selectedLists if it's being tracked
        if (selectedLists && setSelectedLists) {
          setSelectedLists((prevSelected) =>
            prevSelected.filter((id) => id !== listId)
          );
        }
      }
    },
    [lists.length]
  );

  // Update list content
  const updateListContent = useCallback((listId, newContent) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, content: newContent } : list
      )
    );
  }, []);

  // Update list name
  const updateListName = useCallback((listId, newName) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, name: newName } : list
      )
    );
  }, []);

  // Update list category
  const updateListCategory = useCallback((listId, newCategory) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, category: newCategory } : list
      )
    );
  }, []);

  // Add a new category
  const addCategory = useCallback(
    (newCategory) => {
      if (newCategory && !categories.includes(newCategory)) {
        setCategories((prev) => [...prev, newCategory]);
      }
    },
    [categories]
  );

  // Clear all lists content
  const clearAll = useCallback((setSelectedLists) => {
    setLists((prevLists) =>
      prevLists.map((list) => ({ ...list, content: "" }))
    );
    if (setSelectedLists) {
      setSelectedLists([]);
    }
    setImmediateInputs({});
  }, []);

  // Clear a specific list
  const clearList = useCallback((listId) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, content: "" } : list
      )
    );
    setImmediateInputs((prev) => ({
      ...prev,
      [listId]: "",
    }));
  }, []);

  // Trim and remove duplicates from a list
  const trimAndRemoveDuplicates = useCallback(
    (listId, compareMode, caseSensitive) => {
      // Get current list content
      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      // First trim spaces
      const trimmedContent = list.content
        .split(/[,\n]+/)
        .map((item) => item.trim())
        .join("\n");

      // Then remove duplicates
      const parsed = parseInput(trimmedContent, compareMode, caseSensitive);
      const uniqueContent = removeDuplicates(
        parsed,
        compareMode,
        caseSensitive
      ).join("\n");

      // Update both lists and immediateInputs
      updateListContent(listId, uniqueContent);
      setImmediateInputs((prev) => ({
        ...prev,
        [listId]: uniqueContent,
      }));
    },
    [lists, updateListContent]
  );

  // Sort a list's content
  const sortList = useCallback(
    (listId, direction, compareMode, caseSensitive) => {
      const list = lists.find((list) => list.id === listId);
      if (!list) return;

      const sortedContent = sortListContent(
        list.content,
        direction,
        compareMode,
        caseSensitive
      );

      updateListContent(listId, sortedContent);
      setImmediateInputs((prev) => ({
        ...prev,
        [listId]: sortedContent,
      }));
    },
    [lists, updateListContent]
  );

  // Handle case transformations
  const transformCase = useCallback(
    (listId, transformType) => {
      const list = lists.find((list) => list.id === listId);
      if (!list) return;

      let transformedContent = list.content;

      switch (transformType) {
        case "uppercase":
          transformedContent = list.content.toUpperCase();
          break;
        case "lowercase":
          transformedContent = list.content.toLowerCase();
          break;
        case "sentencecase":
          transformedContent = list.content
            .split(/\n+/)
            .map((line) => {
              if (line.trim() === "") return line;
              return line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
            })
            .join("\n");
          break;
        case "camelcase":
          transformedContent = list.content
            .split(/\n+/)
            .map((line) => {
              return line.replace(/\b\w+\b/g, (word, index, fullLine) => {
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
            .join("\n");
          break;
        case "pascalcase":
          transformedContent = list.content
            .split(/\n+/)
            .map((line) => {
              return line.replace(/\b\w+\b/g, (word) => {
                return (
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                );
              });
            })
            .join("\n");
          break;
        default:
          break;
      }

      updateListContent(listId, transformedContent);
      setImmediateInputs((prev) => ({
        ...prev,
        [listId]: transformedContent,
      }));
    },
    [lists, updateListContent]
  );

  // Handle immediate input changes
  const handleImmediateInputChange = useCallback((id, value) => {
    setImmediateInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Effect to update lists when immediate inputs change with debounce handled outside
  useEffect(() => {
    const updateListContentFromInputs = (debouncedInputs) => {
      if (Object.keys(debouncedInputs).length > 0) {
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            content:
              debouncedInputs[list.id] !== undefined
                ? debouncedInputs[list.id]
                : list.content,
          }))
        );
      }
    };

    return () => updateListContentFromInputs;
  }, []);

  // Group lists by category
  const groupedLists = useCallback(() => {
    const grouped = {};
    lists.forEach((list) => {
      const category = list.category || "Default";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(list);
    });
    return grouped;
  }, [lists]);

  return {
    lists,
    setLists,
    nextId,
    categories,
    immediateInputs,
    setImmediateInputs,
    addList,
    removeList,
    updateListContent,
    updateListName,
    updateListCategory,
    addCategory,
    clearAll,
    clearList,
    trimAndRemoveDuplicates,
    sortList,
    transformCase,
    handleImmediateInputChange,
    groupedLists,
  };
}
