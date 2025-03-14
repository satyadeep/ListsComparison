import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormGroup,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { applyFilter } from "../utils/filterUtils";

const FilterDialog = ({ open, onClose, list, onApplyFilter }) => {
  const [pattern, setPattern] = useState("");
  const [filterMode, setFilterMode] = useState("normal"); // 'normal', 'regex', or 'wildcard'
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [invertMatch, setInvertMatch] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);

  // Reset state when dialog opens with new list
  useEffect(() => {
    if (open && list) {
      // Keep existing filter settings
      generatePreview();
    }
  }, [
    open,
    list,
    pattern,
    filterMode,
    caseSensitive,
    invertMatch,
    matchWholeWord,
  ]);

  const generatePreview = () => {
    if (!list?.content || !pattern) {
      setPreview([]);
      return;
    }

    try {
      const items = list.content
        .split(/\n+/)
        .filter((line) => line.trim() !== "");
      const filtered = applyFilter(list.content, pattern, {
        isRegex: filterMode === "regex",
        isWildcard: filterMode === "wildcard",
        caseSensitive,
        invertMatch,
        matchWholeWord: filterMode === "normal" && matchWholeWord,
      });

      const filteredItems = filtered
        .split(/\n+/)
        .filter((line) => line.trim() !== "");
      setPreview(filteredItems);
      setError("");
    } catch (err) {
      setError("Invalid filter pattern");
      setPreview([]);
    }
  };

  const handleApply = () => {
    const filterOptions = {
      pattern,
      isRegex: filterMode === "regex",
      isWildcard: filterMode === "wildcard",
      caseSensitive,
      invertMatch,
      matchWholeWord: filterMode === "normal" && matchWholeWord,
    };

    onApplyFilter(list.id, filterOptions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterAltIcon color="primary" />
          <span>Filter List: {list?.name}</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 1 }}>
          <TextField
            label="Filter Pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder={
              filterMode === "wildcard"
                ? "Use * as wildcard (e.g., app*)"
                : filterMode === "regex"
                ? "Regular expression (e.g., ^app.*)"
                : "Search text"
            }
            error={!!error}
            helperText={error || "Enter a pattern to filter the list"}
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Filter Mode</Typography>
            <RadioGroup
              row
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Plain Text"
              />
              <FormControlLabel
                value="wildcard"
                control={<Radio />}
                label="Wildcard (*)"
              />
              <FormControlLabel
                value="regex"
                control={<Radio />}
                label="Regular Expression"
              />
            </RadioGroup>
          </Box>

          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                />
              }
              label="Case Sensitive"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={invertMatch}
                  onChange={(e) => setInvertMatch(e.target.checked)}
                />
              }
              label="Invert Match"
            />
            {filterMode === "normal" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={matchWholeWord}
                    onChange={(e) => setMatchWholeWord(e.target.checked)}
                  />
                }
                label="Match Whole Word"
              />
            )}
          </FormGroup>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Filter Preview
              <Chip
                label={`${preview.length} matches`}
                size="small"
                color={preview.length > 0 ? "primary" : "default"}
                sx={{ ml: 1 }}
              />
            </Typography>
            <Box
              sx={{
                maxHeight: "200px",
                overflow: "auto",
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 1,
                bgcolor: "background.paper",
              }}
            >
              {pattern ? (
                preview.length > 0 ? (
                  preview.slice(0, 50).map((item, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {item}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No matching items with current filter
                  </Typography>
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Enter a filter pattern to see preview
                </Typography>
              )}
              {preview.length > 50 && (
                <Typography variant="caption" color="text.secondary">
                  {preview.length - 50} more items not shown...
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        {list?.activeFilter && (
          <Button
            onClick={() => {
              onApplyFilter(list.id, null); // null means remove filter
              onClose();
            }}
            color="secondary"
            sx={{ mr: "auto" }}
          >
            Clear Filter
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          disabled={!pattern || !!error}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
