import React, { useCallback, useState, useEffect } from "react";
import { Grid, Paper, Typography, Divider, Box, Chip } from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import ListCard from "./ListCard";
import CategoryHeader from "./CategoryHeader";
import LoadingOverlay from "./LoadingOverlay";
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
  onDeleteCategory,
}) => {
  const muiTheme = useMuiTheme();
  const isDarkMode = muiTheme.palette.mode === "dark";
  const [addingListInfo, setAddingListInfo] = useState({
    adding: false,
    category: null,
  });

  // Listen for changes in the lists array to detect when a new list is added
  useEffect(() => {
    // If we're currently showing the adding placeholder and the list has been added
    if (addingListInfo.adding) {
      // Hide placeholder immediately when groupedLists changes
      setAddingListInfo({ adding: false, category: null });
    }
  }, [groupedLists]);

  // Function to signal that a list is being added to a category
  const setAddingList = (category) => {
    setAddingListInfo({ adding: true, category });
    
    // Use requestAnimationFrame to ensure the DOM is updated before scrolling
    requestAnimationFrame(() => {
      // Find the placeholder element and scroll to it
      const placeholderElement = document.getElementById(`list-placeholder-${category}`);
      if (placeholderElement) {
        placeholderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  // Add this effect to listen for new list addition
  useEffect(() => {
    // Set up an event listener for adding lists
    const handleAddListEvent = (event) => {
      if (event.detail && event.detail.category) {
        setAddingList(event.detail.category);
      }
    };

    // Add the event listener
    window.addEventListener("addList", handleAddListEvent);

    // Clean up the event listener
    return () => {
      window.removeEventListener("addList", handleAddListEvent);
    };
  }, []);

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

  console.log("Rendering ListsSection with groupedLists:", groupedLists);

  // Get all lists for consistent color mapping
  const allLists = Object.values(groupedLists).flat();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ width: "100%", mx: 0 }}>
        {Object.entries(groupedLists).map(([category, categoryLists]) => {
          console.log(
            `Rendering category ${category} with lists:`,
            categoryLists
          );

          return (
            <Grid
              item
              xs={12}
              key={category}
              sx={{ width: "100%", px: { xs: 0, sm: 2 } }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 1, sm: 2 },
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
                  width: "100%",
                }}
              >
                <CategoryHeader
                  category={category}
                  listsCount={categoryLists.length}
                  onDeleteCategory={onDeleteCategory}
                  canDelete={category !== "Default"}
                />

                <Divider sx={{ mb: 2, mt: 1 }} />

                <Grid
                  container
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ width: "100%", mx: 0 }}
                >
                  {categoryLists.map((list) => {
                    console.log(
                      `Rendering list ${list.id} (${list.name}) in category ${category}:`,
                      list
                    );

                    return (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        key={list.id}
                        sx={{ width: "100%" }}
                      >
                        <ListCard
                          list={list}
                          compareMode={compareMode}
                          caseSensitive={caseSensitive}
                          immediateInput={immediateInputs[list.id]}
                          onInputChange={onInputChange}
                          onOpenSettings={onOpenSettings}
                          onOpenFilter={onOpenFilterDialog}
                          onRename={onOpenRenameDialog}
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
                          allLists={allLists} // Pass all lists for color consistency
                        />
                      </Grid>
                    );
                  })}

                  {/* Add placeholder when a new list is being added to this category */}
                  {addingListInfo.adding &&
                    addingListInfo.category === category && (
                      <Grid item xs={12} md={6} sx={{ width: "100%" }}>
                        <Paper
                          id={`list-placeholder-${category}`}
                          elevation={3}
                          sx={{
                            p: { xs: 1, sm: 2 },
                            position: "relative",
                            borderLeft: "4px solid #1976d2",
                            backgroundColor:
                              muiTheme.palette.mode === "dark"
                                ? "rgba(25, 118, 210, 0.08)"
                                : "rgba(25, 118, 210, 0.04)",
                            minHeight: "250px",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography variant="h6">
                              Creating new list...
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              height: "150px",
                              backgroundColor:
                                muiTheme.palette.background.paper,
                              borderRadius: 1,
                              border: `1px solid ${muiTheme.palette.divider}`,
                            }}
                          />

                          <LoadingOverlay
                            message="Adding new list..."
                            subMessage="Please wait while we prepare your new list"
                          />
                        </Paper>
                      </Grid>
                    )}
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ListsSection;
