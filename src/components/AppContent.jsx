import React, { useState, useEffect, useMemo, useCallback } from "react";
import useDebounce from "../hooks/useDebounce";
import { Container, Snackbar, Alert, CssBaseline } from "@mui/material";
import {
  compareAllLists,
  compareSelectedLists,
  clearAll,
} from "../utils/listUtils";
import { saveConfiguration, loadConfiguration } from "../utils/dbUtils";
import { applyFilter } from "../utils/filterUtils";
import AppHeader from "./AppHeader";
import ControlPanel from "./ControlPanel";
import ListsSection from "./ListsSection";
import ResultsSection from "./ResultsSection";
import CustomComparisonSection from "./CustomComparisonSection";
import Footer from "./Footer";
import ListSettingsDialog from "./ListSettingsDialog";
import FilterDialog from "./FilterDialog";
import ListRenameDialog from "./ListRenameDialog";
import { useListNaming } from "../hooks/useListNaming";

function AppContent() {
  // State declarations (keeping all the state here for now)
  const [lists, setLists] = useState([
    { id: 1, name: "List 1", content: "", category: "Default" },
    { id: 2, name: "List 2", content: "", category: "Default" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [results, setResults] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [commonSelected, setCommonSelected] = useState([]);
  const [compareMode, setCompareMode] = useState("text");
  const [comparisonType, setComparisonType] = useState("union");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [resultsSorting, setResultsSorting] = useState({});
  const [categories, setCategories] = useState(["Default"]);
  const [editingList, setEditingList] = useState(null);
  const [listSettingsOpen, setListSettingsOpen] = useState(false);
  const [immediateInputs, setImmediateInputs] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilteringList, setCurrentFilteringList] = useState(null);
  const [filteredContents, setFilteredContents] = useState({});

  // Add state and hook for list naming functionality
  const {
    renameDialogOpen,
    currentRenamingList,
    newListName,
    setNewListName,
    openRenameDialog,
    closeRenameDialog,
    renameList,
    getDefaultListName,
  } = useListNaming(lists, setLists);

  // Create debounced values for each list's content
  const debouncedInputs = useDebounce(immediateInputs, 300);

  // Update lists when debounced inputs change
  useEffect(() => {
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
  }, [debouncedInputs]);

  // Get the effective content of a list (filtered if has active filter)
  const getListContent = useCallback(
    (listId) => {
      if (filteredContents[listId] !== undefined) {
        return filteredContents[listId];
      }

      const list = lists.find((l) => l.id === listId);
      return list?.content || "";
    },
    [lists, filteredContents]
  );

  // Group lists by category
  const groupedLists = useMemo(() => {
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

  // Initialize immediateInputs with the contents from lists on component mount
  useEffect(() => {
    const initialInputs = {};
    lists.forEach((list) => {
      initialInputs[list.id] = list.content;
    });
    setImmediateInputs(initialInputs);
  }, []);

  // Synchronize immediateInputs when list structure changes
  useEffect(() => {
    const newImmediateInputs = {};
    lists.forEach((list) => {
      newImmediateInputs[list.id] = list.content;
    });
    setImmediateInputs((prev) => {
      const updated = { ...newImmediateInputs };
      Object.keys(prev).forEach((id) => {
        const numId = parseInt(id);
        if (lists.some((list) => list.id === numId)) {
          updated[id] = prev[id];
        }
      });
      return updated;
    });
  }, [lists.length]);

  // Update result calculation to use filtered content
  const memoizedResults = useMemo(() => {
    // Create a temporary list array with filtered content
    const effectiveLists = lists.map((list) => ({
      ...list,
      content: getListContent(list.id),
    }));

    return compareAllLists(effectiveLists, compareMode, caseSensitive);
  }, [lists, compareMode, caseSensitive, getListContent]);

  // Update results state only when memoized results change
  useEffect(() => {
    setResults(memoizedResults);
  }, [memoizedResults]);

  // Update common selected calculation
  const memoizedCommonSelected = useMemo(() => {
    // Create a temporary list array with filtered content
    const effectiveLists = lists.map((list) => ({
      ...list,
      content: getListContent(list.id),
    }));

    return compareSelectedLists(
      effectiveLists,
      selectedLists,
      compareMode,
      caseSensitive,
      comparisonType
    );
  }, [
    lists,
    selectedLists,
    compareMode,
    caseSensitive,
    comparisonType,
    getListContent,
  ]);

  // Update commonSelected state only when memoized value changes
  useEffect(() => {
    setCommonSelected(memoizedCommonSelected);
  }, [memoizedCommonSelected]);

  // Handle immediate input changes
  const handleImmediateInputChange = useCallback((id, value) => {
    setImmediateInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Memoize the copyToClipboard function
  const memoizedCopyToClipboard = useCallback((content) => {
    if (typeof content === "object" && Array.isArray(content)) {
      navigator.clipboard
        .writeText(content.join("\n"))
        .then(() => {
          console.log("Content copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else if (typeof content === "string") {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          console.log("Content copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  }, []);

  // Function to save the current state as a new configuration
  const handleSaveConfiguration = async (name) => {
    try {
      const configData = {
        lists,
        categories,
        compareMode,
        comparisonType,
        caseSensitive,
        selectedLists,
      };

      await saveConfiguration(name, configData);

      setNotification({
        open: true,
        message: "Configuration saved successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      setNotification({
        open: true,
        message: "Failed to save configuration",
        severity: "error",
      });
    }
  };

  // Function to load a saved configuration
  const handleLoadConfiguration = (config) => {
    try {
      const { data } = config;
      setLists(data.lists);
      setCompareMode(data.compareMode);
      setComparisonType(data.comparisonType);
      setCaseSensitive(data.caseSensitive);
      setSelectedLists(data.selectedLists);
      if (data.categories) {
        setCategories(data.categories);
      }
      const inputs = {};
      data.lists.forEach((list) => {
        inputs[list.id] = list.content;
      });
      setImmediateInputs(inputs);

      setNotification({
        open: true,
        message: `Configuration "${config.name}" loaded successfully`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to load configuration:", error);
      setNotification({
        open: true,
        message: "Failed to load configuration",
        severity: "error",
      });
    }
  };

  // Function to handle importing data from a file
  const handleImportData = (content) => {
    try {
      // Check if this is a file in our export format (contains list headers)
      if (content.includes("--- List 1 ---") || content.includes("--- List")) {
        // Parse the exported format
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
  };

  // Function to handle exporting data to a file
  const handleExportData = () => {
    try {
      // Create a text blob with all list contents
      let exportData = lists
        .map((list, index) => `--- List ${index + 1} ---\n${list.content}`)
        .join("\n\n");

      // Add the results section
      exportData += "\n\n--- Results ---\n";
      results.forEach((result) => {
        if (result.listId === "common") {
          exportData += `Common to All Lists (${
            result.uniqueValues.length
          } items):\n${result.uniqueValues.join("\n")}\n\n`;
        } else {
          const listIndex = lists.findIndex(
            (list) => list.id === result.listId
          );
          if (listIndex !== -1) {
            exportData += `Unique to List ${listIndex + 1} (${
              result.uniqueValues.length
            } items):\n${result.uniqueValues.join("\n")}\n\n`;
          }
        }
      });

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
  };

  // Open list settings dialog
  const openListSettings = useCallback((list) => {
    setEditingList(list);
    setListSettingsOpen(true);
  }, []);

  // Close list settings dialog
  const closeListSettings = useCallback(() => {
    setListSettingsOpen(false);
    setEditingList(null);
  }, []);

  // Function to update list name
  const handleListNameChange = useCallback((listId, newName) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, name: newName } : list
      )
    );
  }, []);

  // Function to update list category
  const handleListCategoryChange = useCallback((listId, newCategory) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, category: newCategory } : list
      )
    );
  }, []);

  // Function to add a new category
  const handleAddCategory = useCallback(
    (newCategory) => {
      if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
      }
    },
    [categories]
  );

  // Updated function to add a list with custom name and category
  const handleAddList = useCallback(
    (category = "Default") => {
      if (lists.length < 5) {
        const defaultName = getDefaultListName(lists);
        setLists([
          ...lists,
          { id: nextId, name: defaultName, content: "", category },
        ]);
        setNextId(nextId + 1);
      }
    },
    [lists, nextId, getDefaultListName]
  );

  // Handle opening the filter dialog
  const handleOpenFilterDialog = useCallback((list) => {
    setCurrentFilteringList(list);
    setFilterDialogOpen(true);
  }, []);

  // Handle applying a filter
  const handleApplyFilter = useCallback(
    (listId, filterOptions) => {
      if (!filterOptions) {
        setFilteredContents((prev) => {
          const newFiltered = { ...prev };
          delete newFiltered[listId];
          return newFiltered;
        });
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

        setFilteredContents((prev) => ({
          ...prev,
          [listId]: filteredContent,
        }));

        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, activeFilter: filterOptions } : list
          )
        );

        setNotification({
          open: true,
          message: `Filter applied to ${list.name || `List ${listId}`}`,
          severity: "success",
        });
      } catch (error) {
        console.error("Filter error:", error);
        setNotification({
          open: true,
          message: "Error applying filter: " + error.message,
          severity: "error",
        });
      }
    },
    [lists, setNotification]
  );

  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <CssBaseline />
      <AppHeader
        onSaveConfiguration={handleSaveConfiguration}
        onLoadConfiguration={handleLoadConfiguration}
        onImport={handleImportData}
        onExport={handleExportData}
      />

      <Container>
        <ControlPanel
          compareMode={compareMode}
          caseSensitive={caseSensitive}
          lists={lists}
          categories={categories}
          onModeChange={setCompareMode}
          onCaseSensitivityChange={setCaseSensitive}
          onClearAll={() => clearAll(lists, setLists, setSelectedLists)}
          onAddList={handleAddList}
        />

        <ListsSection
          groupedLists={groupedLists}
          immediateInputs={immediateInputs}
          compareMode={compareMode}
          caseSensitive={caseSensitive}
          filteredContents={filteredContents}
          onOpenFilterDialog={handleOpenFilterDialog}
          onOpenSettings={openListSettings}
          onOpenRenameDialog={openRenameDialog} // Add this prop
          onInputChange={handleImmediateInputChange}
          onCopyToClipboard={memoizedCopyToClipboard}
          getListContent={getListContent}
          setLists={setLists}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
        />

        <ResultsSection
          results={results}
          lists={lists}
          resultsSorting={resultsSorting}
          setResultsSorting={setResultsSorting}
          compareMode={compareMode}
          caseSensitive={caseSensitive}
          onCopyToClipboard={memoizedCopyToClipboard}
          getListContent={getListContent}
        />

        <CustomComparisonSection
          lists={lists}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          commonSelected={commonSelected}
          setCommonSelected={setCommonSelected}
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          resultsSorting={resultsSorting}
          setResultsSorting={setResultsSorting}
          compareMode={compareMode}
          caseSensitive={caseSensitive}
          onCopyToClipboard={memoizedCopyToClipboard}
        />

        <Footer />
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <ListSettingsDialog
        open={listSettingsOpen}
        onClose={closeListSettings}
        list={editingList}
        categories={categories}
        onNameChange={handleListNameChange}
        onCategoryChange={handleListCategoryChange}
        onAddCategory={handleAddCategory}
      />

      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        list={currentFilteringList}
        onApplyFilter={handleApplyFilter}
      />

      {/* Add List Rename Dialog */}
      <ListRenameDialog
        open={renameDialogOpen}
        onClose={closeRenameDialog}
        list={currentRenamingList}
        newName={newListName}
        onNameChange={setNewListName}
        onRename={renameList}
      />
    </>
  );
}

export default AppContent;
