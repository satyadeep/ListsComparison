import React from "react";
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Chip,
  FormLabel,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import AbcIcon from "@mui/icons-material/Abc";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import {
  transformCommonToUppercase,
  transformCommonToLowercase,
  transformCommonToSentenceCase,
  transformCommonToCamelCase,
  transformCommonToPascalCase,
  handleComparisonTypeChange,
  sortResultItems,
  getSortedItems,
  handleSelectChange,
} from "../utils/listUtils";
import VirtualizedList from "./VirtualizedList";

const CustomComparisonSection = ({
  lists,
  selectedLists,
  setSelectedLists,
  commonSelected,
  setCommonSelected,
  comparisonType,
  setComparisonType,
  resultsSorting,
  setResultsSorting,
  compareMode,
  caseSensitive,
  onCopyToClipboard,
}) => {
  return (
    <Grid item xs={12} sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, background: "#f0f0f0" }}>
        <Typography variant="h6" gutterBottom>
          Custom List Comparison
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="custom-comparison-label">
            Select Lists to Compare
          </InputLabel>
          <Select
            labelId="custom-comparison-label"
            id="custom-comparison"
            multiple
            value={selectedLists}
            onChange={(event) => handleSelectChange(event, setSelectedLists)}
            input={
              <OutlinedInput
                id="select-lists"
                label="Select Lists to Compare"
              />
            }
            renderValue={(selected) => (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  borderRadius: 4,
                  padding: 1,
                }}
              >
                {selected
                  // Filter out any selected IDs that no longer exist in the lists array
                  .filter((value) => lists.some((list) => list.id === value))
                  .map((value) => {
                    // Get the actual list object
                    const list = lists.find((list) => list.id === value);
                    // Use list name if available, or fallback to index based name
                    const listIndex = lists.findIndex((l) => l.id === value);
                    const displayName = list?.name || `List ${listIndex + 1}`;

                    return <Chip key={value} label={displayName} />;
                  })}
              </Box>
            )}
          >
            {lists.map((list, index) => (
              <MenuItem key={list.id} value={list.id}>
                {list.name || `List ${index + 1}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ mr: 2, display: "inline-block" }}>
            Comparison Type:
          </FormLabel>
          <ToggleButtonGroup
            value={comparisonType}
            exclusive
            onChange={(event, newType) =>
              handleComparisonTypeChange(event, newType, setComparisonType)
            }
            aria-label="comparison type"
            size="small"
          >
            <ToggleButton
              value="intersection"
              aria-label="intersection mode"
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
              Intersection (∩)
            </ToggleButton>
            <ToggleButton
              value="union"
              aria-label="union mode"
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
              Union (∪)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mt: 2, backgroundColor: "white" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" sx={{ mr: 1, padding: 1 }}>
                {comparisonType === "intersection"
                  ? "Common values among selected lists:"
                  : "All values from selected lists (union):"}
              </Typography>
              <Chip
                label={`Total: ${commonSelected.length}`}
                size="small"
                color="info"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
          </Box>
          {/* Replace the List component with VirtualizedList for large datasets */}
          {getSortedItems(
            commonSelected,
            "custom",
            resultsSorting,
            compareMode,
            caseSensitive
          ).length > 0 ? (
            commonSelected.length > 50 ? (
              <VirtualizedList
                items={getSortedItems(
                  commonSelected,
                  "custom",
                  resultsSorting,
                  compareMode,
                  caseSensitive
                )}
                maxHeight={300}
              />
            ) : (
              <List dense>
                {getSortedItems(
                  commonSelected,
                  "custom",
                  resultsSorting,
                  compareMode,
                  caseSensitive
                ).map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            )
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  selectedLists.length < 2
                    ? "Select at least two lists to compare"
                    : "No values found"
                }
              />
            </ListItem>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Tooltip title="Copy to clipboard">
              <IconButton
                size="small"
                onClick={() => onCopyToClipboard(commonSelected)}
                sx={{ mr: 1 }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort Ascending">
              <IconButton
                size="small"
                onClick={() =>
                  sortResultItems(
                    "custom",
                    "asc",
                    resultsSorting,
                    setResultsSorting
                  )
                }
                color={
                  resultsSorting["custom"] === "asc" ? "primary" : "default"
                }
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort Descending">
              <IconButton
                size="small"
                onClick={() =>
                  sortResultItems(
                    "custom",
                    "desc",
                    resultsSorting,
                    setResultsSorting
                  )
                }
                color={
                  resultsSorting["custom"] === "desc" ? "primary" : "default"
                }
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Add text case transformation buttons for the result list */}
          {commonSelected.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                borderTop: "1px solid #eee",
                pt: 1,
              }}
            >
              <Tooltip title="UPPERCASE">
                <IconButton
                  size="small"
                  onClick={() =>
                    transformCommonToUppercase(
                      commonSelected,
                      setCommonSelected
                    )
                  }
                  sx={{ mx: 0.5 }}
                >
                  <FormatSizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="lowercase">
                <IconButton
                  size="small"
                  onClick={() =>
                    transformCommonToLowercase(
                      commonSelected,
                      setCommonSelected
                    )
                  }
                  sx={{ mx: 0.5 }}
                >
                  <AbcIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sentence case">
                <IconButton
                  size="small"
                  onClick={() =>
                    transformCommonToSentenceCase(
                      commonSelected,
                      setCommonSelected
                    )
                  }
                  sx={{ mx: 0.5 }}
                >
                  <TextFormatIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="camelCase">
                <IconButton
                  size="small"
                  onClick={() =>
                    transformCommonToCamelCase(
                      commonSelected,
                      setCommonSelected
                    )
                  }
                  sx={{ mx: 0.5 }}
                >
                  <TextFieldsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="PascalCase">
                <IconButton
                  size="small"
                  onClick={() =>
                    transformCommonToPascalCase(
                      commonSelected,
                      setCommonSelected
                    )
                  }
                  sx={{ mx: 0.5 }}
                >
                  <FormatColorTextIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>
    </Grid>
  );
};

export default CustomComparisonSection;
