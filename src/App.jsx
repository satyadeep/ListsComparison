import React, { useState, useEffect, useMemo, useCallback } from "react";
import useDebounce from "./hooks/useDebounce";
import {
  Container,
  Typography,
  TextField,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Grid,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormLabel,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  CssBaseline,
  useTheme as useMuiTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TextFieldsIcon from "@mui/icons-material/TextFields"; // Added for text transformations
import FormatSizeIcon from "@mui/icons-material/FormatSize"; // Added for uppercase/lowercase
import AbcIcon from "@mui/icons-material/Abc"; // Added for lowercase
import FormatColorTextIcon from "@mui/icons-material/FormatColorText"; // Added for camelCase/PascalCase
import TextFormatIcon from "@mui/icons-material/TextFormat"; // Added for sentence case
import SettingsIcon from "@mui/icons-material/Settings";
import FilterListIcon from "@mui/icons-material/FilterList";
import Badge from "@mui/material/Badge";
import {
  parseInput,
  removeDuplicates,
  addList,
  removeList,
  handleListChange,
  handleSelectChange,
  handleModeChange,
  handleComparisonTypeChange,
  clearAll,
  getListItemCount,
  getDuplicatesCount,
  sortListContent,
  handleSort,
  sortResultItems,
  getSortedItems,
  handleCaseSensitivityChange,
  getListColor, // Add this import
  convertToUppercase,
  convertToLowercase,
  convertToCamelCase,
  convertToPascalCase,
  convertToSentenceCase,
  transformCommonToUppercase,
  transformCommonToLowercase,
  transformCommonToSentenceCase,
  transformCommonToCamelCase,
  transformCommonToPascalCase,
  compareAllLists,
  compareSelectedLists,
  handleTrimSpaces,
} from "./utils/listUtils";
import VirtualizedList from "./components/VirtualizedList";
import { saveConfiguration, loadConfiguration } from "./utils/dbUtils";
import ConfigManager from "./components/ConfigManager";
import ImportExportButtons from "./components/ImportExportButtons";
import ListSettingsDialog from "./components/ListSettingsDialog";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import FilterDialog from "./components/FilterDialog";
import { applyFilter } from "./utils/filterUtils";

function AppContent() {
  const muiTheme = useMuiTheme();
  // Enhanced list data structure with name and category
  const [lists, setLists] = useState([
    { id: 1, name: "List 1", content: "", category: "Default" },
    { id: 2, name: "List 2", content: "", category: "Default" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [results, setResults] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [commonSelected, setCommonSelected] = useState([]);
  const [compareMode, setCompareMode] = useState("text"); // 'numeric' or 'text'
  const [comparisonType, setComparisonType] = useState("union"); // 'intersection' or 'union'
  const [caseSensitive, setCaseSensitive] = useState(false); // New state for case sensitivity
  const [resultsSorting, setResultsSorting] = useState({}); // To track sorting state for result lists

  // Add state for categories
  const [categories, setCategories] = useState(["Default"]);

  // State for managing list settings dialog
  const [editingList, setEditingList] = useState(null);
  const [listSettingsOpen, setListSettingsOpen] = useState(false);

  // State for immediate input values (before debouncing)
  const [immediateInputs, setImmediateInputs] = useState({});

  // Add state for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const listColorsBg = [
    "#f0f8ff", // AliceBlue
    "#f5f5dc", // Beige
    "#e6e6fa", // Lavender
    "#FBF9F1", // HoneyDew
    "#fff0f5", // LavenderBlush
  ];

  // Define border colors for lists
  const listBorderColorsBg = [
    "#295F98", // AliceBlue
    "#A28B55", // Beige
    "#624E88", // Lavender
    "#867070", // HoneyDew
    "#C96868", // LavenderBlush
  ];

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

  // // Memoize the handleClearList function
  // const memoizedHandleClearList = useCallback((listId) => {
  //   setLists((prevLists) =>
  //     prevLists.map((list) =>
  //       list.id === listId ? { ...list, content: "" } : list
  //     )
  //   );
  //   setImmediateInputs((prev) => ({
  //     ...prev,
  //     [listId]: "",
  //   }));
  // }, []);

  // Memoize results calculation
  const memoizedResultsCompare = useMemo(() => {
    return compareAllLists(lists, compareMode, caseSensitive);
  }, [lists, compareMode, caseSensitive]);

  // Update results state only when memoized results change
  useEffect(() => {
    setResults(memoizedResultsCompare);
  }, [memoizedResultsCompare]);

  // // Memoize common selected calculation
  // const memoizedCommonSelected = useMemo(() => {
  //   return compareSelectedLists(
  //     lists,
  //     selectedLists,
  //     compareMode,
  //     caseSensitive,
  //     comparisonType
  //   );
  // }, [lists, selectedLists, compareMode, caseSensitive, comparisonType]);

  // Create a memoized function to handle trim and remove duplicates
  const memoizedTrimAndRemoveDuplicates = useCallback(
    (listId) => {
      // Get current content
      const listContent = lists.find((l) => l.id === listId)?.content || "";

      // First trim spaces
      const trimmedContent = listContent
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
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, content: uniqueContent } : list
        )
      );

      // Also update immediateInputs to keep UI in sync
      setImmediateInputs((prev) => ({
        ...prev,
        [listId]: uniqueContent,
      }));
    },
    [lists, compareMode, caseSensitive]
  );

  // Memoize ResultList component to prevent unnecessary re-renders
  const MemoizedResultList = useCallback(
    ({ title, items, listId, origListId }) => {
      // Use virtualization for lists with more than 50 items
      const useVirtualization = items.length > 50;
      const sortedItems = getSortedItems(
        items,
        listId,
        resultsSorting,
        compareMode,
        caseSensitive
      );

      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: getThemedListColor(origListId, "background"),
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            {typeof title === "string" ? (
              <Typography variant="h6">{title}</Typography>
            ) : (
              title
            )}
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: useVirtualization ? "hidden" : "auto",
              border: "2px solid",
              borderColor: getThemedListColor(origListId, "border"),
              backgroundColor: "white",
              borderRadius: 1,
            }}
          >
            {useVirtualization ? (
              <VirtualizedList items={sortedItems} maxHeight={400} />
            ) : (
              <List dense>
                {sortedItems.length > 0 ? (
                  sortedItems.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No items" />
                  </ListItem>
                )}
              </List>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              pt: 1,
              mt: "auto",
            }}
          >
            <Tooltip title="Copy to clipboard">
              <IconButton
                size="small"
                onClick={() => memoizedCopyToClipboard(items)}
                sx={{ mr: 1 }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort Ascending">
              <IconButton
                size="small"
                onClick={() =>
                  sortResultItems(
                    listId,
                    "asc",
                    resultsSorting,
                    setResultsSorting
                  )
                }
                color={resultsSorting[listId] === "asc" ? "primary" : "default"}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort Descending">
              <IconButton
                size="small"
                onClick={() =>
                  sortResultItems(
                    listId,
                    "desc",
                    resultsSorting,
                    setResultsSorting
                  )
                }
                color={
                  resultsSorting[listId] === "desc" ? "primary" : "default"
                }
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      );
    },
    [lists, compareMode, caseSensitive, resultsSorting, memoizedCopyToClipboard]
  );

  // Replace the original ResultList with memoized version in the render
  const ResultList = MemoizedResultList;

  // Initialize immediateInputs with the contents from lists on component mount
  useEffect(() => {
    const initialInputs = {};
    lists.forEach((list) => {
      initialInputs[list.id] = list.content;
    });
    setImmediateInputs(initialInputs);
  }, []); // Empty dependency array means this runs only once on mount

  // Synchronize immediateInputs when list structure changes
  useEffect(() => {
    const newImmediateInputs = {};

    // Add entries for all current lists
    lists.forEach((list) => {
      newImmediateInputs[list.id] = list.content;
    });

    // Update immediateInputs, preserving any existing values for lists that remain
    setImmediateInputs((prev) => {
      const updated = { ...newImmediateInputs };
      // Keep previous values for existing lists (to not interrupt typing)
      Object.keys(prev).forEach((id) => {
        const numId = parseInt(id);
        if (lists.some((list) => list.id === numId)) {
          updated[id] = prev[id];
        }
      });
      return updated;
    });
  }, [lists.length]); // Only run when the number of lists changes

  // Wrapper for case transformation functions to update both states
  const handleCaseTransformation = useCallback(
    (listId, transformFn) => {
      // First, find the current content
      const listContent = lists.find((l) => l.id === listId)?.content || "";

      // Create a temporary copy of the lists for transformation
      const tempLists = [...lists];

      // Apply the transformation function to the temporary list
      transformFn(listId, (prevLists) => {
        const updatedLists = prevLists.map((list) =>
          list.id === listId ? { ...list, content: list.content } : list
        );

        // Get the transformed content
        const transformedContent = updatedLists.find(
          (l) => l.id === listId
        )?.content;

        // Update immediateInputs immediately for UI
        setImmediateInputs((prev) => ({
          ...prev,
          [listId]: transformedContent,
        }));

        // Return the updated lists for the state update
        return updatedLists;
      });

      // Actually perform the transformation on real state
      transformFn(listId, setLists);
    },
    [lists]
  );

  // Wrapper for sorting
  const handleSortWrapper = useCallback(
    (listId, direction) => {
      const list = lists.find((list) => list.id === listId);
      if (list) {
        // Get the sorted content
        const sortedContent = sortListContent(
          list.content,
          direction,
          compareMode,
          caseSensitive
        );

        // Update lists state
        handleListChange(listId, sortedContent, lists, setLists);

        // Also update immediateInputs for immediate UI feedback
        setImmediateInputs((prev) => ({
          ...prev,
          [listId]: sortedContent,
        }));
      }
    },
    [lists, compareMode, caseSensitive]
  );

  // Update the memoized handle clear list function
  const memoizedHandleClearList = useCallback((listId) => {
    // Update lists state
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, content: "" } : list
      )
    );

    // Also update immediateInputs
    setImmediateInputs((prev) => ({
      ...prev,
      [listId]: "",
    }));
  }, []);

  // Function to save the current state as a new configuration
  const handleSaveConfiguration = async (name) => {
    try {
      // Include categories in the saved data
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

      // Update state with the loaded configuration
      setLists(data.lists);
      setCompareMode(data.compareMode);
      setComparisonType(data.comparisonType);
      setCaseSensitive(data.caseSensitive);
      setSelectedLists(data.selectedLists);

      // Load categories if available, otherwise use default
      if (data.categories) {
        setCategories(data.categories);
      }

      // Update immediateInputs with the loaded list content
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

  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Function to handle importing data from a file
  const handleImportData = (content) => {
    try {
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
    } catch (error) {
      console.error("Import error:", error);
      setNotification({
        open: true,
        message: "Failed to import data",
        severity: "error",
      });
    }
  };

  // Function to handle exporting data to a file
  const handleExportData = () => {
    try {
      // Create a text blob with all list contents
      const exportData = lists
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
  const openListSettings = (list) => {
    setEditingList(list);
    setListSettingsOpen(true);
  };

  // Close list settings dialog
  const closeListSettings = () => {
    setListSettingsOpen(false);
    setEditingList(null);
  };

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

  // Updated function to add a list with custom name and category
  const handleAddList = useCallback(
    (category = "Default") => {
      if (lists.length < 5) {
        const defaultName = `List ${lists.length + 1}`;
        setLists([
          ...lists,
          { id: nextId, name: defaultName, content: "", category },
        ]);
        setNextId(nextId + 1);
      }
    },
    [lists, nextId]
  );

  // Update getListColor to use theme colors
  const getThemedListColor = useCallback(
    (listId, type) => {
      if (type === "common") {
        return muiTheme.palette.mode === "dark" ? "#2d2d2d" : "#f0f0f0";
      }

      const index = lists.findIndex((list) => list.id === listId);
      if (index === -1) return type === "border" ? "#cccccc" : "#ffffff";

      const colorArray =
        type === "border"
          ? muiTheme.listBorders || listBorderColorsBg
          : muiTheme.listColors || listColorsBg;

      return colorArray[index % colorArray.length];
    },
    [lists, muiTheme]
  );

  // Add state for filtering
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilteringList, setCurrentFilteringList] = useState(null);
  const [filteredContents, setFilteredContents] = useState({});

  // Handle opening the filter dialog
  const handleOpenFilterDialog = useCallback((list) => {
    setCurrentFilteringList(list);
    setFilterDialogOpen(true);
  }, []);

  // Handle applying a filter
  const handleApplyFilter = useCallback(
    (listId, filterOptions) => {
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

  // Update result calculation to use filtered content
  const memoizedResults = useMemo(() => {
    // Create a temporary list array with filtered content
    const effectiveLists = lists.map((list) => ({
      ...list,
      content: getListContent(list.id),
    }));

    return compareAllLists(effectiveLists, compareMode, caseSensitive);
  }, [lists, compareMode, caseSensitive, getListContent]);

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

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" sx={{ mb: 4, zIndex: 1300 }}>
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
            <ImportExportButtons
              onImport={handleImportData}
              onExport={handleExportData}
            />
            <ConfigManager
              onSave={handleSaveConfiguration}
              onLoad={handleLoadConfiguration}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        {/* Control section with mode selector, clear all, and add list buttons */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormLabel
              component="legend"
              sx={{ mr: 2, display: "inline-block" }}
            >
              Comparison Mode:
            </FormLabel>
            <ToggleButtonGroup
              value={compareMode}
              exclusive
              onChange={(event, newMode) =>
                handleModeChange(event, newMode, setCompareMode)
              }
              aria-label="comparison mode"
              size="small"
            >
              <ToggleButton
                value="numeric"
                aria-label="numeric mode"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                      color: "white",
                    },
                  },
                }}
              >
                Numeric
              </ToggleButton>
              <ToggleButton
                value="text"
                aria-label="text mode"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                      color: "white",
                    },
                  },
                }}
              >
                Text
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Case sensitivity toggle - only show in text mode */}
            {compareMode === "text" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={caseSensitive}
                    onChange={(event) =>
                      handleCaseSensitivityChange(event, setCaseSensitive)
                    }
                    color="primary"
                  />
                }
                label="Case sensitive Comparison"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteSweepIcon />}
              onClick={() => clearAll(lists, setLists, setSelectedLists)}
            >
              Clear All
            </Button>

            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddList("Default")}
                disabled={lists.length >= 5}
              >
                Add List ({lists.length}/5)
              </Button>
              {categories.length > 1 && (
                <Box sx={{ display: "flex", mt: 1 }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>
                    Add to category:
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {categories.map((category) => (
                      <Chip
                        key={category}
                        label={category}
                        size="small"
                        onClick={() => handleAddList(category)}
                        clickable
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>

        {/* Display lists grouped by category with enhanced styling */}
        <Grid container spacing={4}>
          {Object.entries(groupedLists).map(([category, categoryLists]) => (
            <Grid item xs={12} key={category}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor:
                    muiTheme.palette.mode === "dark"
                      ? "rgba(66, 66, 66, 0.5)"
                      : category === "Default"
                      ? "white"
                      : "#f7f7ff",
                  borderLeft: `4px solid ${
                    category === "Default"
                      ? muiTheme.palette.primary.main
                      : "#5c6bc0"
                  }`,
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 500,
                    color: category === "Default" ? "#1976d2" : "#303f9f",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {category}
                  <Chip
                    size="small"
                    label={`${categoryLists.length} ${
                      categoryLists.length === 1 ? "list" : "lists"
                    }`}
                    sx={{ ml: 2, fontSize: "0.8rem" }}
                  />
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                  {categoryLists.map((list) => {
                    const hasActiveFilter = !!list.activeFilter;
                    const originalItemCount = getListItemCount(
                      list.content,
                      compareMode,
                      caseSensitive
                    );
                    const filteredItemCount = hasActiveFilter
                      ? getListItemCount(
                          getListContent(list.id),
                          compareMode,
                          caseSensitive
                        )
                      : originalItemCount;

                    return (
                      <Grid item xs={12} md={6} key={list.id}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            backgroundColor: getThemedListColor(
                              list.id,
                              "background"
                            ),
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Box display="flex" alignItems="center">
                              <Typography variant="h6" sx={{ mr: 1 }}>
                                {list.name}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <Chip
                                  label={`Total: ${filteredItemCount}${
                                    hasActiveFilter
                                      ? ` / ${originalItemCount}`
                                      : ""
                                  }`}
                                  size="small"
                                  sx={{
                                    fontWeight: "bold",
                                    bgcolor: getThemedListColor(
                                      list.id,
                                      "border"
                                    ),
                                    color: "white",
                                  }}
                                />
                                <Chip
                                  label={`Duplicates: ${getDuplicatesCount(
                                    getListContent(list.id),
                                    compareMode
                                  )}`}
                                  size="small"
                                  sx={{
                                    fontWeight: "bold",
                                    bgcolor: "error.main",
                                    color: "white",
                                  }}
                                />
                                {hasActiveFilter && (
                                  <Chip
                                    label="Filtered"
                                    size="small"
                                    color="warning"
                                    sx={{ fontWeight: "bold" }}
                                  />
                                )}
                              </Box>
                            </Box>

                            <Box>
                              {/* Add filter button */}
                              <Tooltip
                                title={
                                  hasActiveFilter
                                    ? "Edit Filter"
                                    : "Filter List"
                                }
                              >
                                <IconButton
                                  color={
                                    hasActiveFilter ? "warning" : "default"
                                  }
                                  size="small"
                                  onClick={() => handleOpenFilterDialog(list)}
                                  sx={{ mr: 1 }}
                                >
                                  <Badge
                                    color="warning"
                                    variant="dot"
                                    invisible={!hasActiveFilter}
                                  >
                                    <FilterListIcon fontSize="small" />
                                  </Badge>
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="List Settings">
                                <IconButton
                                  size="small"
                                  onClick={() => openListSettings(list)}
                                  sx={{ mr: 1 }}
                                >
                                  <SettingsIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {lists.length > 2 && (
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    removeList(
                                      list.id,
                                      lists,
                                      setLists,
                                      selectedLists,
                                      setSelectedLists
                                    )
                                  }
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}
                            </Box>
                          </Box>

                          {/* Show text field with original content but add a note if filtered */}
                          {hasActiveFilter && (
                            <Alert
                              severity="info"
                              sx={{ mb: 1 }}
                              action={
                                <Button
                                  color="inherit"
                                  size="small"
                                  onClick={() =>
                                    handleApplyFilter(list.id, null)
                                  }
                                >
                                  Clear
                                </Button>
                              }
                            >
                              List is filtered. Showing {filteredItemCount} of{" "}
                              {originalItemCount} items.
                            </Alert>
                          )}

                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            placeholder={
                              compareMode === "numeric"
                                ? "Enter numbers separated by commas or new lines"
                                : "Enter text items separated by commas or new lines"
                            }
                            value={
                              immediateInputs[list.id] !== undefined
                                ? immediateInputs[list.id]
                                : list.content
                            }
                            onChange={(e) =>
                              handleImmediateInputChange(
                                list.id,
                                e.target.value
                              )
                            }
                            onPaste={(e) => {
                              setTimeout(() => {
                                handleImmediateInputChange(
                                  list.id,
                                  e.target.value
                                );
                              }, 10);
                            }}
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: getThemedListColor(
                                    list.id,
                                    "border"
                                  ),
                                  borderWidth: 2,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: getThemedListColor(
                                    list.id,
                                    "border"
                                  ),
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: getThemedListColor(
                                      list.id,
                                      "border"
                                    ),
                                  },
                                backgroundColor: "white",
                              },
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1,
                            }}
                          >
                            <Box>
                              <Tooltip title="Trim spaces & remove duplicates">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    memoizedTrimAndRemoveDuplicates(list.id)
                                  }
                                >
                                  <PlaylistRemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Clear list">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    memoizedHandleClearList(list.id)
                                  }
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Box>
                              <Tooltip title="Copy to clipboard">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    memoizedCopyToClipboard(list.content)
                                  }
                                  sx={{ mx: 0.5 }}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sort Ascending">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleSortWrapper(list.id, "asc")
                                  }
                                  sx={{ mx: 0.5 }}
                                >
                                  <ArrowUpwardIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Sort Descending">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleSortWrapper(list.id, "desc")
                                  }
                                  sx={{ mx: 0.5 }}
                                >
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* Text case transformation buttons */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              mt: 1,
                              borderTop: `1px solid ${getThemedListColor(
                                list.id,
                                "border"
                              )}`,
                              pt: 1,
                            }}
                          >
                            <Tooltip title="UPPERCASE">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  convertToUppercase(list.id, setLists);
                                  setImmediateInputs((prev) => ({
                                    ...prev,
                                    [list.id]:
                                      lists
                                        .find((l) => l.id === list.id)
                                        ?.content.toUpperCase() || "",
                                  }));
                                }}
                                sx={{ mx: 0.5 }}
                              >
                                <FormatSizeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="lowercase">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  convertToLowercase(list.id, setLists);
                                  setImmediateInputs((prev) => ({
                                    ...prev,
                                    [list.id]:
                                      lists
                                        .find((l) => l.id === list.id)
                                        ?.content.toLowerCase() || "",
                                  }));
                                }}
                                sx={{ mx: 0.5 }}
                              >
                                <AbcIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sentence case">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  convertToSentenceCase(list.id, setLists);
                                  // For sentence case we need to compute the conversion directly here too
                                  const content =
                                    lists.find((l) => l.id === list.id)
                                      ?.content || "";
                                  const sentenceCaseContent = content
                                    .split(/\n+/)
                                    .map((line) => {
                                      if (line.trim() === "") return line;
                                      return (
                                        line.charAt(0).toUpperCase() +
                                        line.slice(1).toLowerCase()
                                      );
                                    })
                                    .join("\n");
                                  setImmediateInputs((prev) => ({
                                    ...prev,
                                    [list.id]: sentenceCaseContent,
                                  }));
                                }}
                                sx={{ mx: 0.5 }}
                              >
                                <TextFormatIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="camelCase">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  convertToCamelCase(list.id, setLists);
                                  // For camelCase, we need to compute it explicitly for immediateInputs too
                                  const content =
                                    lists.find((l) => l.id === list.id)
                                      ?.content || "";
                                  const camelCaseContent = content
                                    .split(/\n+/)
                                    .map((line) => {
                                      return line.replace(
                                        /\b\w+\b/g,
                                        (word, index, fullLine) => {
                                          const precedingText =
                                            fullLine.substring(
                                              0,
                                              fullLine.indexOf(word)
                                            );
                                          const isFirstWord =
                                            !precedingText.trim();
                                          if (isFirstWord) {
                                            return word.toLowerCase();
                                          } else {
                                            return (
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1).toLowerCase()
                                            );
                                          }
                                        }
                                      );
                                    })
                                    .join("\n");
                                  setImmediateInputs((prev) => ({
                                    ...prev,
                                    [list.id]: camelCaseContent,
                                  }));
                                }}
                                sx={{ mx: 0.5 }}
                              >
                                <TextFieldsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="PascalCase">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  convertToPascalCase(list.id, setLists);
                                  // For PascalCase, we need to compute it explicitly for immediateInputs too
                                  const content =
                                    lists.find((l) => l.id === list.id)
                                      ?.content || "";
                                  const pascalCaseContent = content
                                    .split(/\n+/)
                                    .map((line) => {
                                      return line.replace(
                                        /\b\w+\b/g,
                                        (word) => {
                                          return (
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1).toLowerCase()
                                          );
                                        }
                                      );
                                    })
                                    .join("\n");
                                  setImmediateInputs((prev) => ({
                                    ...prev,
                                    [list.id]: pascalCaseContent,
                                  }));
                                }}
                                sx={{ mx: 0.5 }}
                              >
                                <FormatColorTextIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Results section */}
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Results:
            </Typography>
          </Grid>

          {/* Dynamic results with sequential numbering */}
          {results
            .filter((result) => result.listId !== "common")
            .map((result) => {
              const listIndex = lists.findIndex(
                (list) => list.id === result.listId
              );
              if (listIndex === -1) return null; // Skip if list was removed

              return (
                <Grid
                  item
                  xs={12}
                  md={Math.max(3, Math.floor(12 / (lists.length + 1)))}
                  key={result.listId}
                >
                  <ResultList
                    title={
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{ mr: 1 }}
                        >
                          Unique to List {listIndex + 1}
                        </Typography>
                        <Chip
                          label={`Total: ${result.uniqueValues.length}`}
                          size="small"
                          // bgcolor={listColors[listIndex % listColors.length]}
                          // color="white"
                          sx={{
                            fontWeight: "bold",
                            color: "white",
                            bgcolor: getThemedListColor(
                              result.listId,
                              "border"
                            ),
                          }}
                        />
                      </Box>
                    }
                    items={result.uniqueValues}
                    listId={`unique-${result.listId}`}
                    origListId={result.listId}
                  />
                </Grid>
              );
            })}

          {/* Common values across all lists */}
          <Grid
            item
            xs={12}
            md={Math.max(3, Math.floor(12 / (lists.length + 1)))}
          >
            <ResultList
              title={
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                    Common to All Lists
                  </Typography>
                  <Chip
                    label={`Total: ${
                      results.find((r) => r.listId === "common")?.uniqueValues
                        .length || 0
                    }`}
                    size="small"
                    color="info"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              }
              items={
                results.find((r) => r.listId === "common")?.uniqueValues || []
              }
              listId="common"
            />
          </Grid>
        </Grid>

        {/* Custom comparison section with sequential numbering */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Paper
            elevation={3}
            sx={{ p: 2, background: getThemedListColor(0, "common") }}
          >
            <Typography variant="h6" gutterBottom>
              Custom List Comparison
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="custom-comparison-label">
                Select Lists to Compare
              </InputLabel>
              <Select
                labelId="custom-comparison-label"
                id="custom-comparison"
                multiple
                value={selectedLists}
                onChange={(event) =>
                  handleSelectChange(event, setSelectedLists)
                }
                input={
                  <OutlinedInput
                    id="select-lists"
                    label="Select Lists to Compare"
                  />
                }
                renderValue={(selected) => (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      borderRadius: 4,
                      padding: 1,
                    }}
                  >
                    {selected
                      // Filter out any selected IDs that no longer exist in the lists array
                      .filter((value) =>
                        lists.some((list) => list.id === value)
                      )
                      .map((value) => {
                        const listIndex = lists.findIndex(
                          (list) => list.id === value
                        );
                        return (
                          <Chip key={value} label={`List ${listIndex + 1}`} />
                        );
                      })}
                  </Box>
                )}
              >
                {lists.map((list, index) => (
                  <MenuItem key={list.id} value={list.id}>
                    List {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <FormLabel
                component="legend"
                sx={{ mr: 2, display: "inline-block" }}
              >
                Comparison Type:
              </FormLabel>
              <ToggleButtonGroup
                value={comparisonType}
                exclusive
                onChange={(event, newType) =>
                  handleComparisonTypeChange(event, newType, setComparisonType)
                }
                aria-label="comparison type"
                size="small"
              >
                <ToggleButton
                  value="intersection"
                  aria-label="intersection mode"
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                        color: "white",
                      },
                    },
                  }}
                >
                  Intersection (∩)
                </ToggleButton>
                <ToggleButton
                  value="union"
                  aria-label="union mode"
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#1976d2",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                        color: "white",
                      },
                    },
                  }}
                >
                  Union (∪)
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ mt: 2, backgroundColor: "white" }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" sx={{ mr: 1, padding: 1 }}>
                    {comparisonType === "intersection"
                      ? "Common values among selected lists:"
                      : "All values from selected lists (union):"}
                  </Typography>
                  <Chip
                    label={`Total: ${commonSelected.length}`}
                    size="small"
                    color="info"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </Box>
              {/* Replace the List component with VirtualizedList for large datasets */}
              {getSortedItems(
                commonSelected,
                "custom",
                resultsSorting,
                compareMode,
                caseSensitive
              ).length > 0 ? (
                commonSelected.length > 50 ? (
                  <VirtualizedList
                    items={getSortedItems(
                      commonSelected,
                      "custom",
                      resultsSorting,
                      compareMode,
                      caseSensitive
                    )}
                    maxHeight={300}
                  />
                ) : (
                  <List dense>
                    {getSortedItems(
                      commonSelected,
                      "custom",
                      resultsSorting,
                      compareMode,
                      caseSensitive
                    ).map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                )
              ) : (
                <ListItem>
                  <ListItemText
                    primary={
                      selectedLists.length < 2
                        ? "Select at least two lists to compare"
                        : "No values found"
                    }
                  />
                </ListItem>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    size="small"
                    onClick={() => memoizedCopyToClipboard(commonSelected)}
                    sx={{ mr: 1 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sort Ascending">
                  <IconButton
                    size="small"
                    onClick={() =>
                      sortResultItems(
                        "custom",
                        "asc",
                        resultsSorting,
                        setResultsSorting
                      )
                    }
                    color={
                      resultsSorting["custom"] === "asc" ? "primary" : "default"
                    }
                  >
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sort Descending">
                  <IconButton
                    size="small"
                    onClick={() =>
                      sortResultItems(
                        "custom",
                        "desc",
                        resultsSorting,
                        setResultsSorting
                      )
                    }
                    color={
                      resultsSorting["custom"] === "desc"
                        ? "primary"
                        : "default"
                    }
                  >
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Add text case transformation buttons for the result list */}
              {commonSelected.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                    borderTop: "1px solid #eee",
                    pt: 1,
                  }}
                >
                  <Tooltip title="UPPERCASE">
                    <IconButton
                      size="small"
                      onClick={() =>
                        transformCommonToUppercase(
                          commonSelected,
                          setCommonSelected
                        )
                      }
                      sx={{ mx: 0.5 }}
                    >
                      <FormatSizeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="lowercase">
                    <IconButton
                      size="small"
                      onClick={() =>
                        transformCommonToLowercase(
                          commonSelected,
                          setCommonSelected
                        )
                      }
                      sx={{ mx: 0.5 }}
                    >
                      <AbcIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sentence case">
                    <IconButton
                      size="small"
                      onClick={() =>
                        transformCommonToSentenceCase(
                          commonSelected,
                          setCommonSelected
                        )
                      }
                      sx={{ mx: 0.5 }}
                    >
                      <TextFormatIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="camelCase">
                    <IconButton
                      size="small"
                      onClick={() =>
                        transformCommonToCamelCase(
                          commonSelected,
                          setCommonSelected
                        )
                      }
                      sx={{ mx: 0.5 }}
                    >
                      <TextFieldsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="PascalCase">
                    <IconButton
                      size="small"
                      onClick={() =>
                        transformCommonToPascalCase(
                          commonSelected,
                          setCommonSelected
                        )
                      }
                      sx={{ mx: 0.5 }}
                    >
                      <FormatColorTextIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 6, pb: 3 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} List Comparison Tool. All rights
            reserved.
          </Typography>
        </Box>
      </Container>

      {/* Add notification component */}
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

      {/* List Settings Dialog */}
      <ListSettingsDialog
        open={listSettingsOpen}
        onClose={closeListSettings}
        list={editingList}
        categories={categories}
        onNameChange={handleListNameChange}
        onCategoryChange={handleListCategoryChange}
        onAddCategory={handleAddCategory}
      />

      {/* Add Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        list={currentFilteringList}
        onApplyFilter={handleApplyFilter}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
