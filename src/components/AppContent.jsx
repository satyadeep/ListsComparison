import React, { useState, useEffect, useMemo, useCallback } from "react";
import useDebounce from "../hooks/useDebounce";
import {
  Container,
  Snackbar,
  Alert,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import ThemeToggle from "./ThemeToggle";
import ImportExportButtons from "./ImportExportButtons";
import ConfigManager from "./ConfigManager";
import ControlPanel from "./ControlPanel";
import ListsSection from "./ListsSection";
import ResultsSection from "./ResultsSection";
import CustomComparisonSection from "./CustomComparisonSection";
import Footer from "./Footer";
import ListSettingsDialog from "./ListSettingsDialog";
import FilterDialog from "./FilterDialog";
import ListRenameDialog from "./ListRenameDialog";
import { useListNaming } from "../hooks/useListNaming";
import { useImportExport } from "../hooks/useImportExport";
import { useNotification } from "../hooks/useNotification";
import { exportToExcel } from "../utils/excelExport"; // Add this import
import {
  compareAllLists,
  compareSelectedLists,
  clearAll,
  copyToClipboard, // Add this import
} from "../utils/listUtils"; // Add compareAllLists import here
import { saveConfiguration, loadConfiguration } from "../utils/dbUtils";
import { applyFilter } from "../utils/filterUtils"; // Add this import
import VisualizationSection from "./visualizations/VisualizationSection";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LoadingOverlay from "./LoadingOverlay";

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

  // Use notification hook
  const { showNotification, closeNotification } = useNotification();

  // Use the updated import/export hook with Excel export functionality
  const { importData, exportTextData, exportExcelData } = useImportExport(
    lists,
    setLists,
    setImmediateInputs,
    notification ? setNotification : showNotification,
    categories,
    setCategories
  );

  // Handle Excel export
  const handleExportExcel = useCallback(() => {
    console.log("Excel export function called in AppContent");
    try {
      exportToExcel(
        lists,
        results,
        commonSelected,
        comparisonType,
        selectedLists
      )
        .then((success) => {
          if (success) {
            setNotification({
              open: true,
              message: "Data exported to Excel successfully",
              severity: "success",
            });
          }
        })
        .catch((error) => {
          console.error("Excel export error:", error);
          setNotification({
            open: true,
            message: `Failed to export to Excel: ${error.message}`,
            severity: "error",
          });
        });
    } catch (error) {
      console.error("Excel export error:", error);
      setNotification({
        open: true,
        message: `Failed to export to Excel: ${error.message}`,
        severity: "error",
      });
    }
  }, [lists, results, commonSelected, comparisonType, selectedLists]);

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

  // Enhanced copyToClipboard function that provides feedback with auto-close
  const handleCopyToClipboard = useCallback((content) => {
    copyToClipboard(content, (message, severity) => {
      setNotification({
        open: true,
        message,
        severity,
      });

      // Auto-close after 3 seconds (optional, if you want to force close beyond Snackbar's autoHideDuration)
      // setTimeout(() => {
      //   setNotification(prev => ({ ...prev, open: false }));
      // }, 3000);
    });
  }, []);

  // Function to save the current state as a new configuration
  const handleSaveConfiguration = async (name) => {
    try {
      // Include categories in the saved data
      const configData = {
        lists,
        categories, // Make sure categories are included
        compareMode,
        comparisonType,
        caseSensitive,
        selectedLists,
      };

      await saveConfiguration(name, configData);

      // Show notification
      if (typeof showNotification === "function") {
        showNotification("Configuration saved successfully", "success");
      } else {
        setNotification({
          open: true,
          message: "Configuration saved successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Failed to save configuration:", error);
      // Show error notification
      if (typeof showNotification === "function") {
        showNotification("Failed to save configuration", "error");
      } else {
        setNotification({
          open: true,
          message: "Failed to save configuration",
          severity: "error",
        });
      }
    }
  };

  // Function to load a saved configuration
  const handleLoadConfiguration = (config) => {
    try {
      console.log("Loading configuration:", config);
      const { data } = config;

      // Update state with the loaded configuration
      setLists(data.lists || []);

      // Calculate the next ID by finding the maximum ID in loaded lists and adding 1
      if (data.lists && data.lists.length > 0) {
        const maxId = Math.max(...data.lists.map((list) => parseInt(list.id)));
        setNextId(maxId + 1);
      }

      setCompareMode(data.compareMode || "text");
      setComparisonType(data.comparisonType || "union");
      setCaseSensitive(data.caseSensitive || false);
      setSelectedLists(data.selectedLists || []);

      // Update categories with special handling for null/undefined
      if (data.categories && Array.isArray(data.categories)) {
        console.log("Setting categories from config:", data.categories);
        setCategories(data.categories);
      } else {
        // Extract unique categories from lists
        const uniqueCategories = new Set(["Default"]);
        if (data.lists && Array.isArray(data.lists)) {
          data.lists.forEach((list) => {
            if (list.category) {
              uniqueCategories.add(list.category);
            }
          });
        }
        const extractedCategories = Array.from(uniqueCategories);
        console.log("Extracted categories from lists:", extractedCategories);
        setCategories(extractedCategories);
      }

      // Update immediateInputs with the loaded list content - clear any existing inputs first
      const inputs = {};
      if (data.lists && Array.isArray(data.lists)) {
        data.lists.forEach((list) => {
          inputs[list.id] = list.content || "";
        });
      }
      setImmediateInputs(inputs); // This replaces the entire immediateInputs object

      // Show success notification
      if (typeof showNotification === "function") {
        showNotification(
          `Configuration "${config.name}" loaded successfully`,
          "success"
        );
      } else if (typeof setNotification === "function") {
        setNotification({
          open: true,
          message: `Configuration "${config.name}" loaded successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Failed to load configuration:", error);
      // Show error notification
      if (typeof showNotification === "function") {
        showNotification(
          "Failed to load configuration: " + error.message,
          "error"
        );
      } else if (typeof setNotification === "function") {
        setNotification({
          open: true,
          message: "Failed to load configuration: " + error.message,
          severity: "error",
        });
      }
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

  // Add function to handle category deletion
  const handleDeleteCategory = useCallback((categoryToDelete) => {
    // Cannot delete the Default category
    if (categoryToDelete === "Default") {
      return;
    }

    // Update lists to move them to Default category
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.category === categoryToDelete
          ? { ...list, category: "Default" }
          : list
      )
    );

    // Remove the category from the categories list
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category !== categoryToDelete)
    );

    // Show success notification
    if (typeof showNotification === "function") {
      showNotification(
        `Category "${categoryToDelete}" deleted successfully`,
        "success"
      );
    } else if (typeof setNotification === "function") {
      setNotification({
        open: true,
        message: `Category "${categoryToDelete}" deleted successfully`,
        severity: "success",
      });
    }
  }, []);

  // Function to get a new unique ID for lists
  const getNewId = () => {
    const id = nextId;
    setNextId(id + 1);
    return id;
  };

  // Function to add a new list
  const handleAddList = (category = "Default") => {
    // Create a new list with the next available ID
    const newList = {
      id: getNewId(),
      category: category,
      content: "",
    };

    // Add it to the lists
    setLists([...lists, newList]);

    // Signal that the list is ready
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent("hideNewListPlaceholder"));
    }, 500);

    return newList.id;
  };

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
  const handleCloseNotification = useCallback((event, reason) => {
    if (reason === "clickaway") return;

    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  // Create a handler for clearing all lists
  const handleClearAll = useCallback(() => {
    // Create empty inputs object based on current lists
    const emptyInputs = {};
    lists.forEach((list) => {
      emptyInputs[list.id] = "";
    });

    // Update immediateInputs first to clear UI immediately
    setImmediateInputs(emptyInputs);

    // Clear all list contents but keep structure
    setLists((prevLists) =>
      prevLists.map((list) => ({ ...list, content: "" }))
    );

    // Clear selected lists
    setSelectedLists([]);

    // Clear filtered contents
    if (typeof setFilteredContents === "function") {
      setFilteredContents({});
    }

    // Show confirmation notification
    if (typeof showNotification === "function") {
      showNotification("All lists cleared", "info");
    } else if (typeof setNotification === "function") {
      setNotification({
        open: true,
        message: "All lists cleared",
        severity: "info",
      });
    }
  }, [lists, setLists, setImmediateInputs, setSelectedLists]);

  const [showVisualizations, setShowVisualizations] = useState(false);
  const [loadingVisualizations, setLoadingVisualizations] = useState(false);
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);

  // Update the loadConfiguration function to show loading state
  const loadConfiguration = (configName) => {
    setLoadingConfiguration(true);

    try {
      // ...existing code...

      // Add delay to ensure loading UI is visible
      setTimeout(() => {
        setLoadingConfiguration(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading configuration:", error);
      setLoadingConfiguration(false);
    }
  };

  // Function to handle showing visualizations
  const handleShowVisualizations = () => {
    setLoadingVisualizations(true);
    setShowVisualizations(true);

    // Simulate calculation time with a delay
    setTimeout(() => {
      setLoadingVisualizations(false);
    }, 2000); // Longer delay to show loading state
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" sx={{ mb: 2, zIndex: 1300 }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <Typography variant="h5">List Comparison Tool</Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              zIndex: 1400,
              position: "relative",
            }}
          >
            <ThemeToggle />
            {/* Removed the Import/Export and Config buttons from here */}
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        disableGutters={window.innerWidth < 600}
        maxWidth="xl"
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          width: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Action buttons island - new section */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <ImportExportButtons
              onImport={importData}
              onExport={exportTextData}
              onExportExcel={handleExportExcel}
            />
            <ConfigManager
              onSave={handleSaveConfiguration}
              onLoad={handleLoadConfiguration}
            />
          </Box>
        </Paper>

        <ControlPanel
          compareMode={compareMode}
          caseSensitive={caseSensitive}
          lists={lists}
          categories={categories}
          onModeChange={setCompareMode}
          onCaseSensitivityChange={setCaseSensitive}
          onClearAll={handleClearAll}
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
          onCopyToClipboard={handleCopyToClipboard}
          getListContent={getListContent}
          setLists={setLists}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          onDeleteCategory={handleDeleteCategory}
        />

        {results.length > 0 && (
          <ResultsSection
            results={results}
            lists={lists}
            resultsSorting={resultsSorting}
            setResultsSorting={setResultsSorting}
            compareMode={compareMode}
            caseSensitive={caseSensitive}
            onCopyToClipboard={handleCopyToClipboard}
            getListContent={getListContent}
          />
        )}

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
          onCopyToClipboard={handleCopyToClipboard}
        />

        {/* Update VisualizationSection to pass compareMode and caseSensitive */}
        {results.length > 0 && (
          <VisualizationSection
            lists={lists}
            results={results}
            compareMode={compareMode}
            caseSensitive={caseSensitive}
          />
        )}

        <Footer />
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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
