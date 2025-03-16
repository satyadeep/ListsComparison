import React from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  OutlinedInput,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { handleComparisonTypeChange } from "../utils/listUtils";
import VirtualizedList from "./VirtualizedList";
import { getSortedItems } from "../utils/listUtils";

const CustomComparisonSection = ({
  lists,
  selectedLists,
  setSelectedLists,
  commonSelected,
  setCommonSelected,
  comparisonType,
  setComparisonType,
  resultsSorting,
  setResultsSorting,
  compareMode,
  caseSensitive,
  onCopyToClipboard,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Get a distinct list ID for the custom results
  const customListId = "custom-comparison";

  // Handle sorting of custom comparison results
  const handleSort = (direction) => {
    setResultsSorting({
      ...resultsSorting,
      [customListId]:
        direction === resultsSorting[customListId] ? null : direction,
    });
  };

  // Get sorted items for display
  const sortedItems = getSortedItems(
    commonSelected,
    customListId,
    resultsSorting,
    compareMode,
    caseSensitive
  );

  // Get border and background colors based on the selected lists
  const getBorderColor = () => {
    return comparisonType === "intersection" ? "#8c6bc4" : "#2e7d32"; // Purple for intersection, green for union
  };

  const getBackgroundColor = () => {
    if (isDarkMode) {
      return comparisonType === "intersection"
        ? "rgba(140, 107, 196, 0.15)"
        : "rgba(46, 125, 50, 0.15)";
    } else {
      return comparisonType === "intersection"
        ? "rgba(140, 107, 196, 0.08)"
        : "rgba(46, 125, 50, 0.08)";
    }
  };

  // Get selected list names for title
  const selectedListNames = selectedLists
    .map((id) => {
      const list = lists.find((list) => list.id === id);
      return list ? list.name || `List ${list.id}` : `List ${id}`;
    })
    .join(", ");

  const title =
    selectedLists.length >= 2
      ? `${
          comparisonType === "intersection" ? "Common in" : "All Items in"
        }: ${selectedListNames}`
      : "Select at least two lists to compare";

  return (
    <Box sx={{ mt: 4, width: "100%" }}>
      <Typography variant="h5" gutterBottom>
        Custom List Comparison
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        {/* List selection with fixed outline issue */}
        <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
          <InputLabel
            id="list-select-label"
            sx={{
              // Ensure label is above the outline
              // backgroundColor: theme.palette.background.paper,
              px: 0.5,
            }}
          >
            Select Lists to Compare
          </InputLabel>
          <Select
            labelId="list-select-label"
            multiple
            input={<OutlinedInput label="Select Lists to Compare" />}
            value={selectedLists}
            onChange={(e) => setSelectedLists(e.target.value)}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const list = lists.find((list) => list.id === id);
                  return list ? list.name || `List ${list.id}` : `List ${id}`;
                })
                .join(", ")
            }
            sx={{
              minHeight: 56,
              "& .MuiSelect-select": {
                pt: selectedLists.length > 0 ? 2 : 1.5,
              },
            }}
          >
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.name || `List ${list.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Comparison type selection */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ mr: 2 }}>Comparison Type:</Typography>
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
              aria-label="intersection"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: isDarkMode
                    ? "rgba(140, 107, 196, 0.7)"
                    : "#8c6bc4",
                  color: "white",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(140, 107, 196, 0.8)"
                      : "#7250b5",
                    color: "white",
                  },
                },
              }}
            >
              Intersection (∩)
            </ToggleButton>
            <ToggleButton
              value="union"
              aria-label="union"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: isDarkMode
                    ? "rgba(46, 125, 50, 0.7)"
                    : "#2e7d32",
                  color: "white",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(46, 125, 50, 0.8)"
                      : "#246627",
                    color: "white",
                  },
                },
              }}
            >
              Union (∪)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Results Panel */}
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          p: { xs: 1, sm: 2 },
          width: "100%",
          borderLeft: `4px solid ${getBorderColor()}`,
          backgroundColor: getBackgroundColor(),
          color: theme.palette.text.primary,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
            <Chip
              label={`${commonSelected.length} items`}
              size="small"
              sx={{
                fontWeight: "bold",
                bgcolor: getBorderColor(),
                color: "white",
                ml: 1,
              }}
            />
          </Box>

          <Box>
            <Tooltip title="Copy to clipboard">
              <IconButton
                size="small"
                onClick={() => onCopyToClipboard(sortedItems)}
                sx={{ ml: 1, color: theme.palette.text.secondary }}
                disabled={commonSelected.length === 0}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort ascending">
              <IconButton
                size="small"
                onClick={() => handleSort("asc")}
                sx={{
                  ml: 1,
                  color: theme.palette.text.secondary,
                  backgroundColor:
                    resultsSorting[customListId] === "asc"
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(0, 0, 0, 0.08)"
                      : "transparent",
                }}
                disabled={commonSelected.length === 0}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort descending">
              <IconButton
                size="small"
                onClick={() => handleSort("desc")}
                sx={{
                  ml: 1,
                  color: theme.palette.text.secondary,
                  backgroundColor:
                    resultsSorting[customListId] === "desc"
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(0, 0, 0, 0.08)"
                      : "transparent",
                }}
                disabled={commonSelected.length === 0}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {selectedLists.length < 2 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Select at least two lists to compare
          </Typography>
        ) : commonSelected.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No matching items found
          </Typography>
        ) : (
          <Box
            sx={{
              height: 250,
              overflow: "auto",
              width: "100%",
              pl: 1,
            }}
          >
            <VirtualizedList items={sortedItems} height={250} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomComparisonSection;
