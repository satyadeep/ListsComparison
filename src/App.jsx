import React, { useState, useEffect } from "react";
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
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
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
} from "./utils/listUtils";

function App() {
  // New state structure for dynamic lists`
  const [lists, setLists] = useState([
    { id: 1, content: "" },
    { id: 2, content: "" },
  ]);
  const [nextId, setNextId] = useState(3);
  const [results, setResults] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [commonSelected, setCommonSelected] = useState([]);
  const [compareMode, setCompareMode] = useState("text"); // 'numeric' or 'text'
  const [comparisonType, setComparisonType] = useState("union"); // 'intersection' or 'union'
  const [caseSensitive, setCaseSensitive] = useState(false); // New state for case sensitivity
  const [resultsSorting, setResultsSorting] = useState({}); // To track sorting state for result lists

  // Compare all lists
  useEffect(() => {
    const parsedLists = lists.map((list) => ({
      id: list.id,
      values: removeDuplicates(
        parseInput(list.content, compareMode, caseSensitive),
        compareMode,
        caseSensitive
      ),
    }));

    // Calculate results for each list and common values
    const newResults = [];

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

      newResults.push({
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

    newResults.push({
      listId: "common",
      uniqueValues: commonValues,
    });

    setResults(newResults);
  }, [lists, compareMode, caseSensitive]); // Updated dependencies

  // Calculate common values among selected lists
  useEffect(() => {
    if (selectedLists.length < 2) {
      setCommonSelected([]);
      return;
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
        const common = selectedParsedLists[0].values.filter((value) =>
          selectedParsedLists.every((list) => {
            if (compareMode === "text" && !caseSensitive) {
              // Case-insensitive comparison for text
              return list.values.some(
                (listValue) =>
                  String(value).toLowerCase() ===
                  String(listValue).toLowerCase()
              );
            }
            return list.values.includes(value);
          })
        );
        setCommonSelected(common);
      } else {
        // Find all unique values (union)
        const union = removeDuplicates(
          selectedParsedLists.flatMap((list) => list.values),
          compareMode,
          caseSensitive
        );
        setCommonSelected(union);
      }
    } else {
      setCommonSelected([]);
    }
  }, [selectedLists, lists, comparisonType, compareMode, caseSensitive]);

  // Array of colors to use for the list counts
  // const listColors = ["primary", "secondary", "success", "warning", "error"];
  // const listColors = ["#585123", "#ef476f", "#006494", "#8338ec", "#2f3e46"];
  // const listColorsBg = ["#F6F0F0", "#F8F3D9", "#BAD8B6", "#C6E7FF", "#F8EDE3"];

  // Handle trimming spaces in a list
  const handleTrimSpaces = (listId) => {
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
  const handleClearList = (listId) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, content: "" } : list
      )
    );
  };

  // Text case transformation functions
  const convertToUppercase = (listId) => {
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

  const convertToLowercase = (listId) => {
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

  const convertToCamelCase = (listId) => {
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
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
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

  const convertToPascalCase = (listId) => {
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

  // New function for sentence case
  const convertToSentenceCase = (listId) => {
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

  // Add these new functions for transforming the common selected results
  const transformCommonToUppercase = () => {
    setCommonSelected(commonSelected.map((item) => String(item).toUpperCase()));
  };

  const transformCommonToLowercase = () => {
    setCommonSelected(commonSelected.map((item) => String(item).toLowerCase()));
  };

  const transformCommonToSentenceCase = () => {
    setCommonSelected(
      commonSelected.map((item) => {
        const str = String(item);
        if (str.trim() === "") return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      })
    );
  };

  const transformCommonToCamelCase = () => {
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

  const transformCommonToPascalCase = () => {
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
  const copyToClipboard = (content) => {
    if (typeof content === "object" && Array.isArray(content)) {
      // If content is an array, join it with newlines
      navigator.clipboard
        .writeText(content.join("\n"))
        .then(() => {
          console.log("Content copied to clipboard");
          // You could add a snackbar notification here
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
          // You could add a snackbar notification here
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  // Display a result list with sorting
  const ResultList = ({ title, items, listId, origListId }) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: getListColor(origListId, lists, "background"),
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
          overflowY: "auto",
          border: "2px solid",
          borderColor: getListColor(origListId, lists, "border"),
          backgroundColor: "white",
          borderRadius: 1,
        }}
      >
        <List dense>
          {getSortedItems(
            items,
            listId,
            resultsSorting,
            compareMode,
            caseSensitive
          ).length > 0 ? (
            getSortedItems(
              items,
              listId,
              resultsSorting,
              compareMode,
              caseSensitive
            ).map((item, index) => (
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
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "flex-end", pt: 1, mt: "auto" }}
      >
        <Tooltip title="Copy to clipboard">
          <IconButton
            size="small"
            onClick={() => copyToClipboard(items)}
            sx={{ mr: 1 }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Sort Ascending">
          <IconButton
            size="small"
            onClick={() =>
              sortResultItems(listId, "asc", resultsSorting, setResultsSorting)
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
              sortResultItems(listId, "desc", resultsSorting, setResultsSorting)
            }
            color={resultsSorting[listId] === "desc" ? "primary" : "default"}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );

  return (
    <>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h5">List Comparison Tool</Typography>
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

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => addList(lists, nextId, setLists, setNextId)}
              disabled={lists.length >= 5}
            >
              Add List ({lists.length}/5)
            </Button>
          </Stack>
        </Box>

        {/* Dynamic input sections with sequential numbering */}
        <Grid container spacing={3}>
          {lists.map((list, index) => (
            <Grid item xs={12} md={6} key={list.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  backgroundColor: getListColor(list.id, lists, "background"),
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
                      List {index + 1}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={`Total: ${getListItemCount(
                          list.content,
                          compareMode,
                          caseSensitive
                        )}`}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          bgcolor: "#1976d2",
                          color: "white",
                        }}
                      />
                      <Chip
                        label={`Duplicates: ${getDuplicatesCount(
                          list.content,
                          compareMode
                        )}`}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          bgcolor: "error.main",
                          color: "white",
                        }}
                      />
                    </Box>
                  </Box>

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
                      sx={{ ml: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder={
                    compareMode === "numeric"
                      ? "Enter numbers separated by commas or new lines"
                      : "Enter text items separated by commas or new lines"
                  }
                  value={list.content}
                  onChange={(e) =>
                    handleListChange(list.id, e.target.value, lists, setLists)
                  }
                  onPaste={(e) => {
                    setTimeout(() => {
                      handleListChange(
                        list.id,
                        e.target.value,
                        lists,
                        setLists
                      );
                    }, 10);
                  }}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: getListColor(list.id, lists, "border"),
                        borderWidth: 2,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: getListColor(list.id, lists, "border"),
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: getListColor(list.id, lists, "border"),
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
                        onClick={() => {
                          handleTrimSpaces(list.id);
                          // After trimming, also remove duplicates
                          const trimmedContent = parseInput(
                            lists.find((l) => l.id === list.id).content,
                            compareMode,
                            caseSensitive
                          );
                          const uniqueContent = removeDuplicates(
                            trimmedContent,
                            compareMode,
                            caseSensitive
                          );
                          handleListChange(
                            list.id,
                            uniqueContent.join("\n"),
                            lists,
                            setLists
                          );
                        }}
                      >
                        <PlaylistRemoveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear list">
                      <IconButton
                        size="small"
                        onClick={() => handleClearList(list.id)}
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
                        onClick={() => copyToClipboard(list.content)}
                        sx={{ mx: 0.5 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sort Ascending">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleSort(
                            list.id,
                            "asc",
                            lists,
                            compareMode,
                            caseSensitive,
                            setLists
                          )
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
                          handleSort(
                            list.id,
                            "desc",
                            lists,
                            compareMode,
                            caseSensitive,
                            setLists
                          )
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
                    borderTop: "1px solid #eee",
                    pt: 1,
                  }}
                >
                  <Tooltip title="UPPERCASE">
                    <IconButton
                      size="small"
                      onClick={() => convertToUppercase(list.id)}
                      sx={{ mx: 0.5 }}
                    >
                      <FormatSizeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="lowercase">
                    <IconButton
                      size="small"
                      onClick={() => convertToLowercase(list.id)}
                      sx={{ mx: 0.5 }}
                    >
                      <AbcIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sentence case">
                    <IconButton
                      size="small"
                      onClick={() => convertToSentenceCase(list.id)}
                      sx={{ mx: 0.5 }}
                    >
                      <TextFormatIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="camelCase">
                    <IconButton
                      size="small"
                      onClick={() => convertToCamelCase(list.id)}
                      sx={{ mx: 0.5 }}
                    >
                      <TextFieldsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="PascalCase">
                    <IconButton
                      size="small"
                      onClick={() => convertToPascalCase(list.id)}
                      sx={{ mx: 0.5 }}
                    >
                      <FormatColorTextIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))}

          {/* Results section */}
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
                            bgcolor: getListColor(
                              result.listId,
                              lists,
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

          {/* Custom comparison section with sequential numbering */}
          <Grid item xs={12} sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
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
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
                    handleComparisonTypeChange(
                      event,
                      newType,
                      setComparisonType
                    )
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

              <Box sx={{ mt: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      {comparisonType === "intersection"
                        ? "Common values among selected lists:"
                        : "All values from selected lists (union):"}
                    </Typography>
                    <Chip
                      label={commonSelected.length}
                      size="small"
                      color="info"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                </Box>
                <List dense>
                  {getSortedItems(
                    commonSelected,
                    "custom",
                    resultsSorting,
                    compareMode,
                    caseSensitive
                  ).length > 0 ? (
                    getSortedItems(
                      commonSelected,
                      "custom",
                      resultsSorting,
                      compareMode,
                      caseSensitive
                    ).map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))
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
                </List>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(commonSelected)}
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
                        resultsSorting["custom"] === "asc"
                          ? "primary"
                          : "default"
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
                        onClick={transformCommonToUppercase}
                        sx={{ mx: 0.5 }}
                      >
                        <FormatSizeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="lowercase">
                      <IconButton
                        size="small"
                        onClick={transformCommonToLowercase}
                        sx={{ mx: 0.5 }}
                      >
                        <AbcIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sentence case">
                      <IconButton
                        size="small"
                        onClick={transformCommonToSentenceCase}
                        sx={{ mx: 0.5 }}
                      >
                        <TextFormatIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="camelCase">
                      <IconButton
                        size="small"
                        onClick={transformCommonToCamelCase}
                        sx={{ mx: 0.5 }}
                      >
                        <TextFieldsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="PascalCase">
                      <IconButton
                        size="small"
                        onClick={transformCommonToPascalCase}
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
    </>
  );
}

export default App;
