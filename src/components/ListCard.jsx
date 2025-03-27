import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  TextField,
  Tooltip,
  Badge,
  Alert,
  Button,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import FilterListIcon from "@mui/icons-material/FilterList";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import AbcIcon from "@mui/icons-material/Abc";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import TableViewIcon from "@mui/icons-material/TableView"; // New icon for Excel/CSV import
import ContentCutIcon from "@mui/icons-material/ContentCut"; // Added for trim spaces functionality
import DragHandleIcon from "@mui/icons-material/DragHandle"; // Import drag handle icon
import { exportDataToExcel } from "../utils/excelExport"; // Use the correct utility function
import {
  getListItemCount,
  getDuplicatesCount,
  convertToUppercase,
  convertToLowercase,
  convertToSentenceCase,
  convertToCamelCase,
  convertToPascalCase,
  getListColor,
} from "../utils/listUtils";
import ExcelCsvImportDialog from "./ExcelCsvImportDialog"; // Import the new component

const ListCard = ({
  list,
  compareMode,
  caseSensitive,
  immediateInput,
  onInputChange,
  onOpenSettings,
  onOpenFilter,
  onRename,
  onRemove,
  onClear,
  onTrimDuplicates,
  onCopyContent,
  onSort,
  getThemedListColor,
  getListContent,
  canRemove,
  setLists,
  allLists,
  onTrimSpaces = null, // Add with default value of null
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // State for processing status
  const processingTimeoutRef = useRef(null);
  const hasActiveFilter = !!list.activeFilter;
  const originalItemCount = getListItemCount(
    list.content,
    compareMode,
    caseSensitive
  );
  const filteredItemCount = hasActiveFilter
    ? getListItemCount(getListContent(list.id), compareMode, caseSensitive)
    : originalItemCount;
  const [textFieldHeight, setTextFieldHeight] = useState(6); // Default rows value
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(textFieldHeight);

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };

  const handleColumnSelected = (columnData) => {
    // Start processing when data is imported from Excel/CSV
    setIsProcessing(true);

    // Use setTimeout to ensure UI updates
    setTimeout(() => {
      // Update the list with the imported data
      onInputChange(list.id, columnData);

      // Set a delay before ending processing state
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, 1500);

      // Close the import dialog
      setImportDialogOpen(false);
    }, 100);
  };

  // Use the same color function as result windows
  const getBorderColor = () =>
    getListColor(list.id, allLists || [], "border", isDarkMode);
  const getBackgroundColor = () =>
    getListColor(list.id, allLists || [], "background", isDarkMode);

  // Add a trim spaces handler that works even if the prop isn't provided
  const handleTrimSpaces = () => {
    if (typeof onTrimSpaces === "function") {
      onTrimSpaces(list.id);
    } else {
      // Fallback implementation if prop isn't provided
      const trimmedContent = list.content
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter((item) => item !== "")
        .join("\n");

      onInputChange(list.id, trimmedContent);
    }
  };

  // Add a handler for removing duplicates without trimming spaces
  const handleRemoveDuplicatesOnly = () => {
    const lines = list.content.split("\n");
    const seen = new Map();
    const result = [];

    for (const line of lines) {
      // Always preserve empty lines
      if (line.trim() === "") {
        result.push(line);
        continue;
      }

      // Use case-insensitive comparison if needed
      const compareLine = caseSensitive ? line : line.toLowerCase();

      if (!seen.has(compareLine)) {
        result.push(line);
        seen.set(compareLine, true);
      }
    }

    onInputChange(list.id, result.join("\n"));
  };

  // Function to generate and download an Excel file with duplicates
  const handleDownloadDuplicates = () => {
    const duplicates = [];
    const lines = list.content.split("\n");
    const seen = new Set();
    const duplicatesSet = new Set();

    // Identify duplicates
    lines.forEach((line) => {
      const compareLine = caseSensitive ? line : line.toLowerCase();
      if (seen.has(compareLine)) {
        duplicatesSet.add(line); // Add original line to duplicates
      } else {
        seen.add(compareLine);
      }
    });

    // Convert duplicatesSet to an array
    duplicates.push(...duplicatesSet);

    // Prepare data for Excel export
    const data = duplicates.map((duplicate, index) => ({
      "Duplicate #": index + 1,
      "Duplicate Value": duplicate,
    }));

    // Export to Excel using the correct utility function
    exportDataToExcel(data, `Duplicates_List_${list.name || list.id}`);
  };

  // Function to handle processing duplicates
  const handleProcessDuplicates = () => {
    setIsProcessing(true); // Set processing state to true
    setTimeout(() => {
      const duplicates = [];
      const lines = list.content.split("\n");
      const seen = new Set();
      const duplicatesSet = new Set();

      // Identify duplicates
      lines.forEach((line) => {
        const compareLine = caseSensitive ? line : line.toLowerCase();
        if (seen.has(compareLine)) {
          duplicatesSet.add(line); // Add original line to duplicates
        } else {
          seen.add(compareLine);
        }
      });

      // Convert duplicatesSet to an array
      duplicates.push(...duplicatesSet);

      // Prepare data for Excel export
      const data = duplicates.map((duplicate, index) => ({
        "Duplicate #": index + 1,
        "Duplicate Value": duplicate,
      }));

      // Export to Excel using the correct utility function
      exportDataToExcel(data, `Duplicates_List_${list.name || list.id}`);
      setIsProcessing(false); // Reset processing state
    }, 1000); // Simulate processing delay
  };

  // Resize handlers
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = textFieldHeight;

    // Add event listeners to window
    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;

    const yDiff = (e.clientY - startYRef.current) / 24; // Approximately one row height
    const newHeight = Math.max(3, Math.round(startHeightRef.current + yDiff)); // Minimum 3 rows

    setTextFieldHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  };

  // Handle paste with processing state
  const handlePaste = (e) => {
    // Start processing state
    setIsProcessing(true);

    // Get the clipboard data directly
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData("text");

    // For non-empty pastes, insert them at cursor position
    if (pastedText) {
      e.preventDefault(); // Prevent default paste behavior

      // Get the current input value and cursor position
      const input = e.target;
      const currentValue = input.value;
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;

      // Create the new value by inserting pasted text at cursor
      const newValue =
        currentValue.substring(0, selectionStart) +
        pastedText +
        currentValue.substring(selectionEnd);

      // Update the immediateInput through onInputChange
      onInputChange(list.id, newValue);

      // Set a delay before ending processing state to ensure calculations complete
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);

        // Try to set cursor position after paste
        try {
          const newCursorPos = selectionStart + pastedText.length;
          if (input.setSelectionRange) {
            setTimeout(() => {
              input.focus();
              input.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
          }
        } catch (err) {
          console.log("Could not set selection range:", err);
        }
      }, 1500);
    } else {
      // If there's no pasted text, just end processing
      setIsProcessing(false);
    }
  };

  // Clean up timeout on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [list.id]);

  // Handle input change with processing state
  const handleInputChange = (id, value) => {
    // For larger inputs, show processing state
    if (value.length > 5000) {
      setIsProcessing(true);

      // Store the value to ensure it's not lost during processing
      const inputValue = value;

      setTimeout(() => {
        // Pass the stored value to ensure it's preserved
        onInputChange(id, inputValue);

        // Set a delay before ending processing state
        processingTimeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }, 10);
    } else {
      // For smaller inputs, no processing state needed
      onInputChange(id, value);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 1, sm: 2 },
        backgroundColor: getBackgroundColor(),
        borderLeft: `4px solid ${getBorderColor()}`,
        width: "100%",
        color: theme.palette.text.primary,
        position: "relative", // Added for absolute positioning of resize handle
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        mb={1}
        gap={1}
      >
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography
            variant="h6"
            sx={{
              mr: 1,
              cursor: "pointer",
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
            onClick={() => onRename(list)}
          >
            {list.name || `List ${list.id}`}
          </Typography>
          <Tooltip title="Rename List">
            <IconButton
              size="small"
              onClick={() => onRename(list)}
              color="primary"
              sx={{ mr: 1 }}
            >
              <DriveFileRenameOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={`Total: ${filteredItemCount}${
                hasActiveFilter ? ` / ${originalItemCount}` : ""
              }`}
              size="small"
              sx={{
                fontWeight: "bold",
                bgcolor: getBorderColor(),
                color: "white",
              }}
            />
            <Tooltip title="Click to download duplicates as an Excel file">
              <Chip
                label={`Duplicates: ${getDuplicatesCount(
                  getListContent(list.id),
                  compareMode
                )}`}
                size="small"
                onClick={handleProcessDuplicates} // Trigger processing duplicates
                sx={{
                  fontWeight: "bold",
                  bgcolor: "error.main",
                  color: "white",
                  cursor: "pointer", // Add pointer cursor for better UX
                  "&:hover": {
                    bgcolor: theme.palette.error.light, // Use a lighter error color for hover
                  },
                }}
              />
            </Tooltip>
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

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {/* Filter button */}
          <Tooltip title={hasActiveFilter ? "Edit Filter" : "Filter List"}>
            <IconButton
              color={hasActiveFilter ? "warning" : "default"}
              size="small"
              onClick={() => onOpenFilter(list)}
              sx={{ mr: 1 }}
            >
              <Badge color="warning" variant="dot" invisible={!hasActiveFilter}>
                <FilterListIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings button */}
          <Tooltip title="List Settings">
            <IconButton
              size="small"
              onClick={() => onOpenSettings(list)}
              sx={{ mr: 1 }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete button */}
          {canRemove && (
            <IconButton
              color="error"
              onClick={() => onRemove(list.id)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Show alert if filtered */}
      {hasActiveFilter && (
        <Alert
          severity="info"
          sx={{ mb: 1 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => onOpenFilter(list, true)}
            >
              Clear
            </Button>
          }
        >
          List is filtered. Showing {filteredItemCount} of {originalItemCount}{" "}
          items.
        </Alert>
      )}

      {/* Text field for list content with resize handle */}
      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          multiline
          rows={textFieldHeight}
          placeholder={
            compareMode === "numeric"
              ? "Enter numbers separated by commas or new lines"
              : "Enter text items separated by commas or new lines"
          }
          value={immediateInput !== undefined ? immediateInput : list.content}
          onChange={(e) => handleInputChange(list.id, e.target.value)}
          onPaste={handlePaste}
          variant="outlined"
          disabled={isProcessing} // Disable text area while processing
          sx={{
            "& .MuiOutlinedInput-root": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: getBorderColor(),
                borderWidth: 2,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: getBorderColor(),
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: getBorderColor(),
              },
              "&.Mui-disabled": {
                opacity: 0.7,
                "& textarea": {
                  color: theme.palette.text.primary, // Keep text visible when disabled
                  opacity: 0.8,
                },
              },
              backgroundColor: isDarkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "white",
            },
          }}
        />

        {/* Show processing message */}
        {isProcessing && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              zIndex: 1000,
              textAlign: "center",
              backdropFilter: "blur(3px)",
              boxShadow: theme.shadows[5],
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              Please wait while we process the data...
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
              Calculating items and identifying duplicates
            </Typography>
          </Box>
        )}

        {/* Resize handle */}
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            right: 2,
            cursor: "ns-resize",
            color: getBorderColor(),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            opacity: 0.7,
            "&:hover": {
              opacity: 1,
            },
          }}
          onMouseDown={handleResizeStart}
        >
          <DragHandleIcon />
        </Box>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 1,
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 1,
        }}
      >
        <Box>
          <Tooltip title="Trim spaces">
            <IconButton size="small" onClick={handleTrimSpaces}>
              <ContentCutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove duplicates">
            <IconButton
              size="small"
              onClick={handleRemoveDuplicatesOnly}
              sx={{ ml: 1 }}
            >
              <PlaylistRemoveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear list">
            <IconButton
              size="small"
              onClick={() => onClear(list.id)}
              sx={{ ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import from Excel/CSV">
            <IconButton
              size="small"
              onClick={handleOpenImportDialog}
              sx={{ ml: 1 }}
            >
              <TableViewIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => onCopyContent(list.content)}
              sx={{ mx: 0.5 }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sort Ascending">
            <IconButton
              size="small"
              onClick={() => onSort(list.id, "asc")}
              sx={{ mx: 0.5 }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Sort Descending">
            <IconButton
              size="small"
              onClick={() => onSort(list.id, "desc")}
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
          borderTop: `1px solid ${getBorderColor()}`,
          pt: 1,
        }}
      >
        <Tooltip title="UPPERCASE">
          <IconButton
            size="small"
            onClick={() => {
              convertToUppercase(list.id, setLists);
              onInputChange(list.id, list.content.toUpperCase());
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
              onInputChange(list.id, list.content.toLowerCase());
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
              const sentenceCaseContent = list.content
                .split(/\n+/)
                .map((line) => {
                  if (line.trim() === "") return line;
                  return (
                    line.charAt(0).toUpperCase() + line.slice(1).toLowerCase()
                  );
                })
                .join("\n");
              onInputChange(list.id, sentenceCaseContent);
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
              const content = list.content;
              const camelCaseContent = content
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
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                      );
                    }
                  });
                })
                .join("\n");
              onInputChange(list.id, camelCaseContent);
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
              const content = list.content;
              const pascalCaseContent = content
                .split(/\n+/)
                .map((line) => {
                  return line.replace(/\b\w+\b/g, (word) => {
                    return (
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    );
                  });
                })
                .join("\n");
              onInputChange(list.id, pascalCaseContent);
            }}
            sx={{ mx: 0.5 }}
          >
            <FormatColorTextIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Import Dialog */}
      <ExcelCsvImportDialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        onColumnSelected={handleColumnSelected}
      />
    </Paper>
  );
};

export default ListCard;
