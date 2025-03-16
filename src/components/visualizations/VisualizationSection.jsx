import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  useTheme,
  Paper,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VennDiagram from "./VennDiagram";
import ListStatistics from "./ListStatistics";

// Update the component to accept compareMode and caseSensitive props
const VisualizationSection = ({
  lists,
  results,
  compareMode = "text",
  caseSensitive = false,
}) => {
  const [showTooltips, setShowTooltips] = useState(true);
  const theme = useTheme();

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
    </Box>
  );
};

export default VisualizationSection;
