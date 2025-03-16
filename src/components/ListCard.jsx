import React, { useState } from "react";
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
  const hasActiveFilter = !!list.activeFilter;
  const originalItemCount = getListItemCount(
    list.content,
    compareMode,
    caseSensitive
  );
  const filteredItemCount = hasActiveFilter
    ? getListItemCount(getListContent(list.id), compareMode, caseSensitive)
    : originalItemCount;

  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
  };

  const handleColumnSelected = (columnData) => {
    onInputChange(list.id, columnData);
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

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 1, sm: 2 },
        backgroundColor: getBackgroundColor(),
        borderLeft: `4px solid ${getBorderColor()}`,
        width: "100%",
        color: theme.palette.text.primary,
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

      {/* Text field for list content */}
      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder={
          compareMode === "numeric"
            ? "Enter numbers separated by commas or new lines"
            : "Enter text items separated by commas or new lines"
        }
        value={immediateInput !== undefined ? immediateInput : list.content}
        onChange={(e) => onInputChange(list.id, e.target.value)}
        onPaste={(e) => {
          setTimeout(() => {
            onInputChange(list.id, e.target.value);
          }, 10);
        }}
        variant="outlined"
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
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "white",
          },
        }}
      />

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
              onClick={() => onTrimDuplicates(list.id)}
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
