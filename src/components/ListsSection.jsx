import React, { useCallback } from "react";
import { Grid, Paper, Typography, Divider, Box, Chip } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import ListCard from "./ListCard";
import { removeList, parseInput, removeDuplicates } from "../utils/listUtils";

const ListsSection = ({
  groupedLists,
  immediateInputs,
  compareMode,
  caseSensitive,
  onOpenFilterDialog,
  onOpenSettings,
  onOpenRenameDialog, // Add this prop
  onInputChange,
  onCopyToClipboard,
  getListContent,
  setLists,
  selectedLists,
  setSelectedLists,
}) => {
  const muiTheme = useMuiTheme();

  // Get theme-based colors for lists
  const getThemedListColor = useCallback(
    (listId, type) => {
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

      const lists = Object.values(groupedLists).flat();
      const index = lists.findIndex((list) => list.id === listId);
      if (index === -1) return type === "border" ? "#cccccc" : "#ffffff";

      const colorArray =
        type === "border"
          ? muiTheme.listBorders || listBorderColorsBg
          : muiTheme.listColors || listColorsBg;

      return colorArray[index % colorArray.length];
    },
    [muiTheme, groupedLists]
  );

  // Implement the missing trimDuplicates function
  const trimDuplicates = useCallback(
    (listId) => {
      const allLists = Object.values(groupedLists).flat();
      const list = allLists.find((list) => list.id === listId);

      if (!list) return;

      // First trim spaces
      const trimmedContent = list.content
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

      // Update lists state
      setLists((prevLists) =>
        prevLists.map((l) =>
          l.id === listId ? { ...l, content: uniqueContent } : l
        )
      );

      // Also update immediateInputs through the parent's handler
      onInputChange(listId, uniqueContent);
    },
    [groupedLists, setLists, compareMode, caseSensitive, onInputChange]
  );

  const handleClearList = useCallback(
    (listId) => {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, content: "" } : list
        )
      );
      onInputChange(listId, "");
    },
    [setLists, onInputChange]
  );

  const handleSort = useCallback(
    (listId, direction) => {
      const allLists = Object.values(groupedLists).flat();
      const list = allLists.find((l) => l.id === listId);
      if (!list) return;

      // Simple sort implementation (proper one would be in listUtils)
      const items = list.content.split(/\n+/).filter(Boolean);
      const sorted =
        direction === "asc" ? items.sort() : items.sort().reverse();
      const sortedContent = sorted.join("\n");

      setLists((prevLists) =>
        prevLists.map((l) =>
          l.id === listId ? { ...l, content: sortedContent } : l
        )
      );

      onInputChange(listId, sortedContent);
    },
    [groupedLists, setLists, onInputChange]
  );

  return (
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
                const allLists = Object.values(groupedLists).flat();

                return (
                  <Grid item xs={12} md={6} key={list.id}>
                    <ListCard
                      list={list}
                      compareMode={compareMode}
                      caseSensitive={caseSensitive}
                      immediateInput={immediateInputs[list.id]}
                      onInputChange={onInputChange}
                      onOpenSettings={onOpenSettings}
                      onOpenFilter={onOpenFilterDialog}
                      onRename={onOpenRenameDialog} // Add this prop
                      onRemove={(id) =>
                        removeList(
                          id,
                          allLists,
                          setLists,
                          selectedLists,
                          setSelectedLists
                        )
                      }
                      onClear={handleClearList}
                      onTrimDuplicates={trimDuplicates}
                      onCopyContent={onCopyToClipboard}
                      onSort={handleSort}
                      getThemedListColor={getThemedListColor}
                      getListContent={getListContent}
                      canRemove={allLists.length > 2}
                      setLists={setLists}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ListsSection;
