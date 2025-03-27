import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { compareSelectedLists } from "../../utils/listUtils";
import VennDiagram from "../visualizations/VennDiagram";
import ListStatistics from "../visualizations/ListStatistics";

const CustomComparisonSection = ({
  lists,
  setComparisonResults,
  comparisonResults,
}) => {
  const [selectedLists, setSelectedLists] = useState([]);
  const [compareMode, setCompareMode] = useState("text");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showStatistics, setShowStatistics] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle changing selected lists
  const handleListChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedLists(value);
  };

  // Process comparison when button is clicked
  const handleCompare = () => {
    if (selectedLists.length < 2) {
      // Need at least 2 lists to compare
      return;
    }

    setIsProcessing(true); // Start processing

    // Use setTimeout to ensure UI updates before heavy processing
    setTimeout(() => {
      try {
        // Process each list individually
        const results = selectedLists.map((listId) => {
          const list = lists.find((l) => l.id === listId);
          if (!list) return { listId, uniqueValues: [] };

          const uniqueValues = compareSelectedLists(
            lists,
            [listId],
            compareMode,
            caseSensitive,
            "unique"
          );

          return { listId, uniqueValues };
        });

        // Get common items across all selected lists
        const commonItems = compareSelectedLists(
          lists,
          selectedLists,
          compareMode,
          caseSensitive,
          "intersection"
        );

        // Add common items to results
        results.push({ listId: "common", uniqueValues: commonItems });

        // Update parent component with results
        setComparisonResults(results);
      } catch (error) {
        console.error("Error processing comparison:", error);
      } finally {
        setIsProcessing(false); // End processing
      }
    }, 50); // Short delay to allow UI to update
  };

  // Reset selection when lists change
  useEffect(() => {
    setSelectedLists([]);
    setComparisonResults([]);
  }, [lists, setComparisonResults]);

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Custom List Comparison
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="list-select-label">
              Select Lists to Compare
            </InputLabel>
            <Select
              labelId="list-select-label"
              id="list-select"
              multiple
              value={selectedLists}
              onChange={handleListChange}
              label="Select Lists to Compare"
              disabled={isProcessing}
            >
              {lists.map((list) => (
                <MenuItem key={list.id} value={list.id}>
                  {list.name || `List ${list.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="compare-mode-label">Comparison Mode</InputLabel>
            <Select
              labelId="compare-mode-label"
              id="compare-mode"
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value)}
              label="Comparison Mode"
              disabled={isProcessing}
            >
              <MenuItem value="text">Text (Line by Line)</MenuItem>
              <MenuItem value="word">Word by Word</MenuItem>
              <MenuItem value="character">Character by Character</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                disabled={isProcessing}
              />
            }
            label="Case Sensitive"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showStatistics}
                onChange={(e) => setShowStatistics(e.target.checked)}
                disabled={isProcessing}
              />
            }
            label="Show Statistics"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showTooltips}
                onChange={(e) => setShowTooltips(e.target.checked)}
                disabled={isProcessing}
              />
            }
            label="Show Tooltips"
          />
        </FormGroup>

        <Button
          variant="contained"
          color="primary"
          onClick={handleCompare}
          disabled={selectedLists.length < 2 || isProcessing}
          sx={{ height: 40, alignSelf: "flex-start" }}
        >
          Compare Lists
        </Button>
      </Box>

      {/* Show loading overlay when processing */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        open={isProcessing}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body2">Processing your lists...</Typography>
      </Backdrop>

      {/* Results section */}
      {comparisonResults.length > 0 && (
        <Box sx={{ mt: 3, position: "relative" }}>
          <Typography variant="h6" gutterBottom>
            Comparison Results
          </Typography>

          {/* Venn Diagram */}
          <VennDiagram
            lists={lists.filter((list) => selectedLists.includes(list.id))}
            results={comparisonResults}
            showTooltips={showTooltips}
            compareMode={compareMode}
            caseSensitive={caseSensitive}
          />

          {/* Statistics */}
          {showStatistics && (
            <ListStatistics
              lists={lists.filter((list) => selectedLists.includes(list.id))}
              results={comparisonResults}
              showTooltips={showTooltips}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CustomComparisonSection;
