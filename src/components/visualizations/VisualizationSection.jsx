import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  useTheme,
  Paper,
  Button,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VennDiagram from "./VennDiagram";
import ListStatistics from "./ListStatistics";
import LoadingOverlay from "../LoadingOverlay";

// Update the component to accept compareMode and caseSensitive props
const VisualizationSection = ({
  lists,
  results,
  compareMode = "text",
  caseSensitive = false,
}) => {
  const [showTooltips, setShowTooltips] = useState(true);
  const [showVisualizations, setShowVisualizations] = useState(false);
  const [loadingVisualizations, setLoadingVisualizations] = useState(false);
  const [visualizationsReady, setVisualizationsReady] = useState(false);
  const visualizationComponents = useRef({
    vennsReady: false,
    statsReady: false,
  });
  const theme = useTheme();

  // Function to check if all visualizations are ready
  const checkAllVisualizationsReady = () => {
    if (
      visualizationComponents.current.vennsReady &&
      visualizationComponents.current.statsReady
    ) {
      // Small delay to ensure all rendering is complete before showing
      setTimeout(() => {
        setVisualizationsReady(true);
        setLoadingVisualizations(false);
      }, 300);
    }
  };

  // Create handlers for when each visualization finishes rendering
  const handleVennDiagramReady = () => {
    visualizationComponents.current.vennsReady = true;
    checkAllVisualizationsReady();
  };

  const handleStatisticsReady = () => {
    visualizationComponents.current.statsReady = true;
    checkAllVisualizationsReady();
  };

  // Direct function to handle showing visualizations - no complex state management
  const handleShowVisualizations = () => {
    // Both states immediately in a single batch
    setShowVisualizations(true);
    setLoadingVisualizations(true);

    // Longer delay to ensure visualizations are fully rendered
    setTimeout(() => {
      // First make the visualizations ready
      setVisualizationsReady(true);

      // Keep overlay visible for additional time to ensure charts are rendered
      setTimeout(() => {
        setLoadingVisualizations(false);
      }, 1500);
    }, 2000);
  };

  // Add function to handle hiding visualizations
  const handleHideVisualizations = () => {
    setShowVisualizations(false);
    setVisualizationsReady(false);
    visualizationComponents.current = { vennsReady: false, statsReady: false };
  };

  // If not showing visualizations, just show the button
  if (!showVisualizations) {
    return (
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Visualizations
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleShowVisualizations}
            startIcon={<VisibilityIcon />}
            sx={{ py: 1.5, px: 3, fontSize: "1rem" }}
          >
            Show me the visualizations!
          </Button>
        </Box>
      </Box>
    );
  }

  // Render visualizations with immediate placeholders
  return (
    <Box sx={{ mt: 6, mb: 4, position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Visualizations</Typography>

        {/* Add hide visualizations button */}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleHideVisualizations}
          startIcon={<VisibilityOffIcon />}
        >
          Hide Visualizations
        </Button>
      </Box>

      {/* First visualization container - Venn diagram */}
      <Paper
        elevation={3}
        sx={{ p: 2, mb: 3, minHeight: "300px", position: "relative" }}
      >
        {visualizationsReady && (
          <VennDiagram
            lists={lists}
            results={results}
            showTooltips={showTooltips}
            compareMode={compareMode}
            caseSensitive={caseSensitive}
          />
        )}

        {/* Loading overlay specific to Venn diagram */}
        {(loadingVisualizations || !visualizationsReady) && (
          <LoadingOverlay
            message="Generating Venn diagram..."
            subMessage="Creating visual representation of list relationships"
          />
        )}
      </Paper>

      {/* Second visualization container - Statistics */}
      <Paper
        elevation={3}
        sx={{ p: 2, mb: 3, minHeight: "300px", position: "relative" }}
      >
        {visualizationsReady && (
          <ListStatistics
            lists={lists}
            results={results}
            showTooltips={showTooltips}
          />
        )}

        {/* Loading overlay specific to statistics section */}
        {(loadingVisualizations || !visualizationsReady) && (
          <LoadingOverlay
            message="Generating statistical analysis..."
            subMessage="Calculating metrics and preparing charts"
          />
        )}
      </Paper>
    </Box>
  );
};

export default VisualizationSection;
