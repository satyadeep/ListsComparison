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
};

export default ResultList;
