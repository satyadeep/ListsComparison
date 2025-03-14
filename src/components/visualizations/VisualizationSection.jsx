import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import VennDiagram from "./VennDiagram";
import ListStatistics from "./ListStatistics";

const VisualizationSection = ({ lists, results }) => {
  if (!lists || lists.length === 0 || !results || results.length === 0) {
    return null;
  }

  return (
    <Container>
      <Box sx={{ mt: 6, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Visual Data Analysis
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* Venn Diagram */}
        {lists.length >= 2 && <VennDiagram lists={lists} results={results} />}

        {/* Statistics Charts */}
        <ListStatistics lists={lists} results={results} />
      </Box>
    </Container>
  );
};

export default VisualizationSection;
