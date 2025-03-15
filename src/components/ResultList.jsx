import React from "react";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VirtualizedList from "./VirtualizedList";
import { getSortedItems, getListColor } from "../utils/listUtils";

const ResultList = ({
  title,
  items,
  listId,
  origListId,
  resultsSorting,
  setResultsSorting,
  compareMode,
  caseSensitive,
  onCopyToClipboard,
  lists, // Make sure this prop is passed from the parent
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const handleSort = (direction) => {
    setResultsSorting({
      ...resultsSorting,
      [listId]: direction === resultsSorting[listId] ? null : direction,
    });
  };

  const sortedItems = getSortedItems(
    items,
    listId,
    resultsSorting,
    compareMode,
    caseSensitive
  );

  // Get border color based on list ID using the same function that input lists use
  const getBorderColor = () => {
    if (listId === "common") return isDarkMode ? "#66bb6a" : "#4caf50"; // Green for common values, adjusted for dark mode

    // Use the getListColor function from listUtils to ensure consistency
    return getListColor(Number(origListId), lists, "border");
  };

  // Get background color based on list ID using the same function that input lists use
  const getBackgroundColor = () => {
    if (listId === "common") {
      return isDarkMode ? "rgba(76, 175, 80, 0.15)" : "rgba(76, 175, 80, 0.08)";
    }

    // For unique values in dark mode, use a darker version of the background color
    const baseColor = getListColor(Number(origListId), lists, "background");

    // If in dark mode, darken the background color appropriately
    if (isDarkMode) {
      // Adjust colors for dark mode - make them darker but still distinguishable
      return theme.palette.background.paper;
    }

    return baseColor;
  };

  return (
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
            label={`${items.length} items`}
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
                  resultsSorting[listId] === "asc"
                    ? isDarkMode
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.08)"
                    : "transparent",
              }}
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
                  resultsSorting[listId] === "desc"
                    ? isDarkMode
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.08)"
                    : "transparent",
              }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {items.length > 0 ? (
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
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No items found
        </Typography>
      )}
    </Paper>
  );
};

export default ResultList;
