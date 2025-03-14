import React from "react";
import {
  Box,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Stack,
  Button,
  Typography,
  Chip,
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
    <Box
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <FormLabel component="legend" sx={{ mr: 2, display: "inline-block" }}>
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
            label="Case sensitive Comparison"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<DeleteSweepIcon />}
          onClick={onClearAll}
        >
          Clear All
        </Button>

        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddList("Default")}
            disabled={lists.length >= 5}
          >
            Add List ({lists.length}/5)
          </Button>
          {categories.length > 1 && (
            <Box sx={{ display: "flex", mt: 1 }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                Add to category:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {categories.map((category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    onClick={() => onAddList(category)}
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default ControlPanel;
