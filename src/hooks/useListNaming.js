import { useState, useCallback } from "react";

/**
 * Custom hook for managing list naming operations
 */
export function useListNaming(initialLists, setLists) {
  // State for the rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [currentRenamingList, setCurrentRenamingList] = useState(null);
  const [newListName, setNewListName] = useState("");

  // Function to open the rename dialog
  const openRenameDialog = useCallback((list) => {
    setCurrentRenamingList(list);
    setNewListName(list.name);
    setRenameDialogOpen(true);
  }, []);

  // Function to close the rename dialog
  const closeRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
    setCurrentRenamingList(null);
    setNewListName("");
  }, []);

  // Function to rename a list
  const renameList = useCallback(
    (listId, newName) => {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, name: newName } : list
        )
      );
      closeRenameDialog();
    },
    [setLists, closeRenameDialog]
  );

  // Function to get a default name for new lists
  const getDefaultListName = useCallback((lists) => {
    // Find the highest number in existing list names
    const nameNumbers = lists
      .map((list) => {
        const match = list.name.match(/List (\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => !isNaN(num));

    const maxNumber = nameNumbers.length > 0 ? Math.max(...nameNumbers) : 0;
    return `List ${maxNumber + 1}`;
  }, []);

  return {
    renameDialogOpen,
    currentRenamingList,
    newListName,
    setNewListName,
    openRenameDialog,
    closeRenameDialog,
    renameList,
    getDefaultListName,
  };
}
