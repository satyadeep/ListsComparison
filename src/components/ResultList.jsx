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
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VirtualizedList from "./VirtualizedList";
import { getSortedItems, sortResultItems } from "../utils/listUtils";
import { useTheme as useMuiTheme } from "@mui/material/styles";

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
}) => {
  const muiTheme = useMuiTheme();
  // Use virtualization for lists with more than 50 items
  const useVirtualization = items.length > 50;
  const sortedItems = getSortedItems(
    items,
    listId,
    resultsSorting,
    compareMode,
    caseSensitive
  );

  // Get theme-based colors for lists
  const getThemedListColor = (listId, type) => {
    if (type === "common") {
      return muiTheme.palette.mode === "dark" ? "#2d2d2d" : "#f0f0f0";
    }

    // Default fallback colors
    const listColorsBg = [
      "#f0f8ff",
      "#f5f5dc",
      "#e6e6fa",
      "#FBF9F1",
      "#fff0f5",
    ];

    const listBorderColorsBg = [
      "#295F98",
      "#A28B55",
      "#624E88",
      "#867070",
      "#C96868",
    ];

    const index = typeof listId === "number" ? listId % 5 : 0;

    const colorArray =
      type === "border"
        ? muiTheme.listBorders || listBorderColorsBg
        : muiTheme.listColors || listColorsBg;

    return colorArray[index % colorArray.length];
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        p: { xs: 1, sm: 2 },
        width: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h6" component="h3" gutterBottom>
          {title} ({items.length})
        </Typography>

        <Box>
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => onCopyToClipboard(items)}
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
              color={resultsSorting[listId] === "desc" ? "primary" : "default"}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {items.length > 0 ? (
        <Box
          sx={{
            height: 250,
            overflow: "auto",
            width: "100%",
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
