import React from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import {
  handleModeChange,
  handleCaseSensitivityChange,
} from "../utils/listUtils";

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
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <FormLabel
              component="legend"
              sx={{ mr: 1, display: "inline-block" }}
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
              size="small"
            >
              <ToggleButton
                value="numeric"
                aria-label="numeric mode"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                      color: "white",
                    },
                  },
                }}
              >
                Numeric
              </ToggleButton>
              <ToggleButton
                value="text"
                aria-label="text mode"
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                      color: "white",
                    },
                  },
                }}
              >
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
                />
              }
              label="Case sensitive"
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DeleteSweepIcon />}
            onClick={onClearAll}
            data-testid="clear-all-button"
            size="medium"
          >
            Clear All
          </Button>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onAddList("Default")}
              disabled={lists.length >= 5}
              size="medium"
            >
              Add List ({lists.length}/5)
            </Button>
            {categories.length > 1 && (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{ mr: 0.5, alignSelf: "center" }}
                >
                  Add to category:
                </Typography>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    onClick={() => onAddList(category)}
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
