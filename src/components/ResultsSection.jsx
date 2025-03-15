import React from "react";
import { Box, Typography, Divider, Grid } from "@mui/material";
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
  // Separate common results from unique results
  const commonResult = results.find((result) => result.listId === "common");
  const uniqueResults = results.filter((result) => result.listId !== "common");

  return (
    <Box sx={{ mt: 4, width: "100%" }}>
      <Typography variant="h5" gutterBottom>
        Comparison Results
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: "100%", mx: 0 }}>
        {/* Common Values */}
        {commonResult && (
          <Grid item xs={12} md={6} lg={4} sx={{ width: "100%" }}>
            <ResultList
              title="Common Values"
              items={commonResult.uniqueValues}
              listId="common"
              origListId="common"
              resultsSorting={resultsSorting}
              setResultsSorting={setResultsSorting}
              compareMode={compareMode}
              caseSensitive={caseSensitive}
              onCopyToClipboard={onCopyToClipboard}
              lists={lists} // Pass the full lists array
            />
          </Grid>
        )}

        {/* Unique Values */}
        {uniqueResults.map((result) => {
          const list = lists.find((list) => list.id === result.listId);
          const listName = list
            ? list.name || `List ${list.id}`
            : `List ${result.listId}`;

          return (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={result.listId}
              sx={{ width: "100%" }}
            >
              <ResultList
                title={`Unique to ${listName}`}
                items={result.uniqueValues}
                listId={result.listId}
                origListId={result.listId}
                resultsSorting={resultsSorting}
                setResultsSorting={setResultsSorting}
                compareMode={compareMode}
                caseSensitive={caseSensitive}
                onCopyToClipboard={onCopyToClipboard}
                lists={lists} // Pass the full lists array
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ResultsSection;
