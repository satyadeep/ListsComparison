import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  IconButton,
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { exportData } from "../utils/fileUtils";

const ExportDialog = ({ open, onClose, lists, results, commonSelected }) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportSource, setExportSource] = useState("result-common");
  const [filename, setFilename] = useState("export");

  const handleExport = () => {
    let dataToExport = [];

    // Determine what data to export
    switch (exportSource) {
      case "result-common":
        dataToExport =
          results.find((r) => r.listId === "common")?.uniqueValues || [];
        break;
      case "custom":
        dataToExport = commonSelected;
        break;
      default:
        // If it starts with 'list-', export the specific list
        if (exportSource.startsWith("list-")) {
          const listId = parseInt(exportSource.replace("list-", ""));
          const list = lists.find((l) => l.id === listId);
          if (list) {
            dataToExport = list.content
              .split(/[\n,]+/)
              .map((item) => item.trim())
              .filter((item) => item !== "");
          }
        }
        // If it starts with 'result-', export the specific result
        else if (exportSource.startsWith("result-")) {
          const listId = parseInt(exportSource.replace("result-", ""));
          const result = results.find((r) => r.listId === listId);
          if (result) {
            dataToExport = result.uniqueValues;
          }
        }
    }

    // Export the data in the selected format
    exportData(dataToExport, exportFormat, filename);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Export Data
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            margin="normal"
            variant="outlined"
            helperText="Enter filename without extension"
          />
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel>Export Source</InputLabel>
          <Select
            value={exportSource}
            onChange={(e) => setExportSource(e.target.value)}
            label="Export Source"
          >
            <MenuItem value="result-common">Common Items (All Lists)</MenuItem>
            <MenuItem value="custom">Custom Comparison Results</MenuItem>
            {lists.map((list, index) => (
              <MenuItem key={`list-${list.id}`} value={`list-${list.id}`}>
                List {index + 1} - Raw Content
              </MenuItem>
            ))}
            {results
              .filter((r) => r.listId !== "common")
              .map((result) => {
                const listIndex = lists.findIndex(
                  (list) => list.id === result.listId
                );
                if (listIndex === -1) return null;
                return (
                  <MenuItem
                    key={`result-${result.listId}`}
                    value={`result-${result.listId}`}
                  >
                    Unique to List {listIndex + 1}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>

        <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
          <FormLabel component="legend">Export Format</FormLabel>
          <RadioGroup
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            row
          >
            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            <FormControlLabel value="json" control={<Radio />} label="JSON" />
            <FormControlLabel value="excel" control={<Radio />} label="Excel" />
            <FormControlLabel value="text" control={<Radio />} label="Text" />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleExport} variant="contained" color="primary">
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
