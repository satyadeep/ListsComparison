import React from "react";
import { Grid, Box, Typography, Chip } from "@mui/material";
import ResultList from "./ResultList";

const ResultsSection = ({
  results,
  lists,
  resultsSorting,
  setResultsSorting,
  compareMode,
  caseSensitive,
  onCopyToClipboard,
  getListContent,
}) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Results:
        </Typography>
      </Grid>

      {/* Dynamic results with sequential numbering */}
      {results
        .filter((result) => result.listId !== "common")
        .map((result) => {
          const listIndex = lists.findIndex(
            (list) => list.id === result.listId
          );
          if (listIndex === -1) return null; // Skip if list was removed

          return (
            <Grid
              item
              xs={12}
              md={Math.max(3, Math.floor(12 / (lists.length + 1)))}
              key={result.listId}
            >
              <ResultList
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                      Unique to List {listIndex + 1}
                    </Typography>
                    <Chip
                      label={`Total: ${result.uniqueValues.length}`}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                }
                items={result.uniqueValues}
                listId={`unique-${result.listId}`}
                origListId={result.listId}
                resultsSorting={resultsSorting}
                setResultsSorting={setResultsSorting}
                compareMode={compareMode}
                caseSensitive={caseSensitive}
                onCopyToClipboard={onCopyToClipboard}
              />
            </Grid>
          );
        })}

      {/* Common values across all lists */}
      <Grid item xs={12} md={Math.max(3, Math.floor(12 / (lists.length + 1)))}>
        <ResultList
          title={
            <Box display="flex" alignItems="center">
              <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                Common to All Lists
              </Typography>
              <Chip
                label={`Total: ${
                  results.find((r) => r.listId === "common")?.uniqueValues
                    .length || 0
                }`}
                size="small"
                color="info"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
          }
          items={results.find((r) => r.listId === "common")?.uniqueValues || []}
          listId="common"
          resultsSorting={resultsSorting}
          setResultsSorting={setResultsSorting}
          compareMode={compareMode}
          caseSensitive={caseSensitive}
          onCopyToClipboard={onCopyToClipboard}
        />
      </Grid>
    </Grid>
  );
};

export default ResultsSection;
