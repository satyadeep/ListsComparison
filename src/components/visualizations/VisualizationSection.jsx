import React, { useState, useEffect } from "react";
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
  const theme = useTheme();

  // Function to handle showing visualizations
  const handleShowVisualizations = () => {
    setLoadingVisualizations(true);
    setShowVisualizations(true);

    // Simulate calculation time with a longer delay
    setTimeout(() => {
      setLoadingVisualizations(false);
    }, 2000);
  };

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

  if (!lists || lists.length === 0 || !results || results.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6, mb: 2, width: "100%", px: 0 }}>
      <Typography variant="h5" gutterBottom>
        Visual Data Analysis
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Tooltip Control */}
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InfoOutlinedIcon color="info" fontSize="small" />
          <Typography variant="body2">
            Hover over chart elements to see the actual data items
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={showTooltips}
              onChange={(e) => setShowTooltips(e.target.checked)}
              color="primary"
            />
          }
          label="Show Data Tooltips"
          sx={{ m: 0 }}
        />
      </Paper>

      {/* Pass compareMode and caseSensitive to VennDiagram */}
      <VennDiagram
        lists={lists}
        results={results}
        showTooltips={showTooltips}
        compareMode={compareMode}
        caseSensitive={caseSensitive}
      />

      {/* Statistics Charts */}
      <ListStatistics
        lists={lists}
        results={results}
        showTooltips={showTooltips}
      />

      {/* Loading overlay while calculating visualizations */}
      {loadingVisualizations && (
        <LoadingOverlay
          message="Generating visualizations..."
          subMessage="Analyzing data and creating charts"
        />
      )}
    </Box>
  );
};

export default VisualizationSection;
