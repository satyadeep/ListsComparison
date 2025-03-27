import React, { useState, useEffect } from "react";
import {
  Box,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Chip,
  Paper,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import {
  handleModeChange,
  handleCaseSensitivityChange,
} from "../utils/listUtils";
import LoadingOverlay from "./LoadingOverlay";

const ControlPanel = ({
  compareMode,
  caseSensitive,
  lists,
  categories,
  onModeChange,
  onCaseSensitivityChange,
  onClearAll,
  onAddList,
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery("(max-width:480px)");
  const [isAddingList, setIsAddingList] = useState(false);
  const [addingCategory, setAddingCategory] = useState(null);

  // Simplified function for adding a new list
  const handleAddList = (category = "Default") => {
    if (lists.length < 5) {
      setIsAddingList(true);
      setAddingCategory(category);

      // First show placeholder
      document.dispatchEvent(
        new CustomEvent("showNewListPlaceholder", {
          detail: { category },
        })
      );

      // Then after a short delay, create the list and hide the placeholder
      setTimeout(() => {
        // Create the list
        onAddList(category);

        // Hide placeholder
        document.dispatchEvent(new CustomEvent("hideNewListPlaceholder"));
        setIsAddingList(false);
      }, 600);
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 1.5 : 2,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <FormLabel
              component="legend"
              sx={{
                mr: 1,
                display: "inline-block",
                whiteSpace: "nowrap",
                fontSize: isXsScreen ? "0.875rem" : "inherit",
              }}
            >
              Comparison Mode:
            </FormLabel>
            <ToggleButtonGroup
              value={compareMode}
              exclusive
              onChange={(event, newMode) =>
                handleModeChange(event, newMode, onModeChange)
              }
              aria-label="comparison mode"
              size={isXsScreen ? "small" : "medium"}
              sx={{
                flexGrow: isMobile ? 1 : 0,
                "& .MuiToggleButton-root": {
                  color: theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                },
              }}
            >
              <ToggleButton value="numeric" aria-label="numeric mode">
                Numeric
              </ToggleButton>
              <ToggleButton value="text" aria-label="text mode">
                Text
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Case sensitivity toggle - only show in text mode */}
          {compareMode === "text" && (
            <FormControlLabel
              control={
                <Switch
                  checked={caseSensitive}
                  onChange={(event) =>
                    handleCaseSensitivityChange(event, onCaseSensitivityChange)
                  }
                  color="primary"
                  size={isXsScreen ? "small" : "medium"}
                />
              }
              label="Case sensitive"
              sx={{
                mr: 0,
                flexGrow: isMobile ? 1 : 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: isXsScreen ? "0.875rem" : "inherit",
                },
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            gap: isMobile ? 1.5 : 2,
            alignItems: "flex-start",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteSweepIcon />}
            onClick={onClearAll}
            data-testid="clear-all-button"
            size={isXsScreen ? "small" : "medium"}
            fullWidth={isMobile}
          >
            Clear All
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddList("Default")}
                disabled={lists.length >= 5 || isAddingList}
                size={isXsScreen ? "small" : "medium"}
                fullWidth={isMobile}
              >
                Add List ({lists.length}/5)
              </Button>
            </Box>
            {categories.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  mt: 0.5,
                  justifyContent: isMobile ? "flex-start" : "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    mr: 0.5,
                    alignSelf: "center",
                    fontSize: isXsScreen ? "0.7rem" : "0.75rem",
                  }}
                >
                  Add to category:
                </Typography>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    onClick={() => handleAddList(category)}
                    clickable
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ControlPanel;
