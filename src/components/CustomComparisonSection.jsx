import React, { useState, useEffect, useRef } from "react";
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
import LoadingOverlay from "./LoadingOverlay";

// Create a standalone function for intersection button
const IntersectionButton = ({ comparisonType, onClick }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <ToggleButton
      value="intersection"
      aria-label="intersection"
      onClick={onClick}
      selected={comparisonType === "intersection"}
      sx={{
        "&.Mui-selected": {
          backgroundColor: isDarkMode ? "rgba(140, 107, 196, 0.7)" : "#8c6bc4",
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
  );
};

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
  const [isCalculating, setIsCalculating] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState({
    message: "",
    subMessage: "",
  });
  const timerRef = useRef(null);

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

  // Simple function to show overlay with specific message
  const showOverlay = (type) => {
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);

    // Set appropriate messages based on type
    if (type === "intersection") {
      setOverlayMessage({
        message: "Calculating intersection...",
        subMessage: "Finding common items between selected lists",
      });
    } else {
      setOverlayMessage({
        message: "Calculating union...",
        subMessage: "Combining all unique items from selected lists",
      });
    }

    // Show the overlay
    setIsCalculating(true);

    // Set timer to hide overlay after delay
    timerRef.current = setTimeout(() => {
      setIsCalculating(false);
    }, 1000);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Simplify the click handlers for intersection operation with better feedback
  const handleIntersectionClick = () => {
    setComparisonType("intersection");

    // Only show overlay if enough lists selected
    if (selectedLists.length >= 2) {
      // Create and directly apply an overlay with improved styling and messaging
      const overlayDiv = document.createElement("div");
      overlayDiv.id = "temp-overlay";
      overlayDiv.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
        transition: opacity 0.2s ease-in-out;
      `;

      // Add enhanced content with better spinner animation
      overlayDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
          <svg width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="#8c6bc4" stroke-width="4" 
              style="animation: spin 1s linear infinite; transform-origin: center;" />
            <circle cx="25" cy="25" r="10" fill="none" stroke="#d1c4e9" stroke-width="3" 
              style="animation: pulse 1.5s ease-in-out infinite; transform-origin: center;" />
          </svg>
        </div>
        <div style="font-weight: 600; font-size: 18px; color: #8c6bc4;">Calculating intersection...</div>
        <div style="margin-top: 8px; font-size: 14px; max-width: 260px; text-align: center;">
          Finding common items between selected lists
        </div>
      `;

      // Add enhanced animation style
      const style = document.createElement("style");
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);

      // Find the Paper element in CustomComparisonSection
      const paperElement = document.querySelector(
        '[data-testid="custom-comparison-paper"]'
      );
      if (paperElement) {
        paperElement.style.position = "relative";
        paperElement.appendChild(overlayDiv);

        // Fade out animation before removing
        setTimeout(() => {
          if (document.getElementById("temp-overlay")) {
            const overlay = document.getElementById("temp-overlay");
            overlay.style.opacity = "0";
            setTimeout(() => overlay.remove(), 200);
          }
        }, 1000);
      }
    }
  };

  const handleUnionClick = () => {
    setComparisonType("union");

    // Only show overlay if enough lists selected
    if (selectedLists.length >= 2) {
      // Same approach but with union message
      const overlayDiv = document.createElement("div");
      overlayDiv.id = "temp-overlay";
      overlayDiv.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
      `;

      // Add content with union message
      overlayDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#90caf9" stroke-width="4" 
              style="animation: spin 1s linear infinite; transform-origin: center;" />
          </svg>
        </div>
        <div style="font-weight: 500; font-size: 16px;">Calculating union...</div>
        <div style="margin-top: 8px; font-size: 14px;">Combining all unique items from selected lists</div>
      `;

      // Find the Paper element and append overlay
      const paperElement = document.querySelector(
        '[data-testid="custom-comparison-paper"]'
      );
      if (paperElement) {
        paperElement.style.position = "relative";
        paperElement.appendChild(overlayDiv);

        // Remove after a delay
        setTimeout(() => {
          if (document.getElementById("temp-overlay")) {
            document.getElementById("temp-overlay").remove();
          }
        }, 1000);
      }
    }
  };

  // Update the handleListToggle function to show loading state
  const handleListToggle = (listId) => {
    let newSelected = [...selectedLists];

    if (newSelected.includes(listId)) {
      newSelected = newSelected.filter((id) => id !== listId);
    } else {
      newSelected.push(listId);
    }

    // Show loading state when changing selection
    setIsCalculating(true);

    // Use setTimeout to ensure UI updates before calculation
    setTimeout(() => {
      setSelectedLists(newSelected);

      // Hide loading state after a brief delay
      setTimeout(() => {
        setIsCalculating(false);
      }, 800);
    }, 50);
  };

  // Track when dropdown is open to avoid processing during selection
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Enhanced function to handle list selection changes
  const handleListSelectionChange = (event) => {
    const newSelected = event.target.value;
    // Only process changes when the dropdown is closed (user completed their selection)
    if (!isDropdownOpen) {
      setIsCalculating(true);

      // Use requestAnimationFrame to ensure UI updates before calculation
      requestAnimationFrame(() => {
        setSelectedLists(newSelected);

        // Hide loading state after processing
        setTimeout(() => {
          setIsCalculating(false);
        }, 800);
      });
    } else {
      // If dropdown is still open, just update the selection without processing
      setSelectedLists(newSelected);
    }
  };

  // Handle dropdown open/close events
  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);

    // Process comparison after dropdown closes if we have enough lists selected
    if (selectedLists.length >= 2) {
      setIsCalculating(true);

      // Small delay to ensure UI updates before processing
      setTimeout(() => {
        // Just trigger calculation by setting calculating state
        // The result is already calculated by the parent component's useEffect
        setTimeout(() => {
          setIsCalculating(false);
        }, 800);
      }, 100);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
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
            onChange={handleListSelectionChange}
            onOpen={handleDropdownOpen}
            onClose={handleDropdownClose}
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
            onChange={(event, newType) => newType && setComparisonType(newType)}
            aria-label="comparison type"
            size="small"
          >
            <IntersectionButton
              comparisonType={comparisonType}
              onClick={handleIntersectionClick}
            />
            <ToggleButton
              value="union"
              aria-label="union"
              onClick={handleUnionClick}
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

      {/* Results Panel with position: relative for proper overlay positioning */}
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          p: { xs: 1, sm: 2 },
          width: "100%",
          borderLeft: `4px solid ${getBorderColor()}`,
          backgroundColor: getBackgroundColor(),
          color: theme.palette.text.primary,
          position: "relative", // Add position relative for the overlay
        }}
        data-testid="custom-comparison-paper"
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

        {/* Add loading overlay only over the results panel */}
        {isCalculating && (
          <LoadingOverlay
            message={overlayMessage.message}
            subMessage={overlayMessage.subMessage}
          />
        )}
      </Paper>
    </Box>
  );
};

export default CustomComparisonSection;
