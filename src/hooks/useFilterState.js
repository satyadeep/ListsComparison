import { useState, useCallback } from "react";
import { applyFilter } from "../utils/filterUtils";

/**
 * Custom hook for managing list filtering
 */
export function useFilterState() {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilteringList, setCurrentFilteringList] = useState(null);
  const [filteredContents, setFilteredContents] = useState({});

  // Open filter dialog for a list
  const openFilterDialog = useCallback((list) => {
    setCurrentFilteringList(list);
    setFilterDialogOpen(true);
  }, []);

  // Close filter dialog
  const closeFilterDialog = useCallback(() => {
    setFilterDialogOpen(false);
    setCurrentFilteringList(null);
  }, []);

  // Apply or remove filter for a list
  const applyListFilter = useCallback(
    (listId, filterOptions, lists, setLists, setNotification) => {
      if (!filterOptions) {
        // If null, remove the filter
        setFilteredContents((prev) => {
          const newFiltered = { ...prev };
          delete newFiltered[listId];
          return newFiltered;
        });

        // Update the list state to show it's no longer filtered
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, activeFilter: undefined } : list
          )
        );
        return;
      }

      const list = lists.find((list) => list.id === listId);
      if (!list) return;

      try {
        const filteredContent = applyFilter(
          list.content,
          filterOptions.pattern,
          {
            isRegex: filterOptions.isRegex,
            isWildcard: filterOptions.isWildcard,
            caseSensitive: filterOptions.caseSensitive,
            invertMatch: filterOptions.invertMatch,
            matchWholeWord: filterOptions.matchWholeWord,
          }
        );

        // Store the filtered content
        setFilteredContents((prev) => ({
          ...prev,
          [listId]: filteredContent,
        }));

        // Update the list state to show it's filtered
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, activeFilter: filterOptions } : list
          )
        );

        if (setNotification) {
          setNotification({
            open: true,
            message: `Filter applied to ${list.name || `List ${listId}`}`,
            severity: "success",
          });
        }
      } catch (error) {
        console.error("Filter error:", error);
        if (setNotification) {
          setNotification({
            open: true,
            message: "Error applying filter: " + error.message,
            severity: "error",
          });
        }
      }
    },
    []
  );

  // Get actual content (filtered if has active filter)
  const getListContent = useCallback(
    (listId, lists) => {
      if (filteredContents[listId] !== undefined) {
        return filteredContents[listId];
      }

      const list = lists.find((l) => l.id === listId);
      return list?.content || "";
    },
    [filteredContents]
  );

  return {
    filterDialogOpen,
    currentFilteringList,
    filteredContents,
    openFilterDialog,
    closeFilterDialog,
    applyListFilter,
    getListContent,
  };
}
