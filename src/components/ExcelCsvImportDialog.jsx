import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const ExcelCsvImportDialog = ({ open, onClose, onColumnSelected }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const theme = useTheme();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    setLoading(true);
    setError("");
    setColumns([]);
    setSelectedColumn("");
    setPreview([]);
    setParsedData([]);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          handleParseResults(results.data, results.meta.fields);
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
          setLoading(false);
        },
      });
    } else if (["xlsx", "xls"].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);

          if (parsedData.length > 0) {
            const columnNames = Object.keys(parsedData[0]);
            handleParseResults(parsedData, columnNames);
          } else {
            setError("No data found in the Excel file.");
            setLoading(false);
          }
        } catch (err) {
          setError(`Error parsing Excel file: ${err.message}`);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError(
        "Unsupported file format. Please upload .csv, .xlsx or .xls files."
      );
      setLoading(false);
    }
  };

  const handleParseResults = (data, columnNames) => {
    setParsedData(data);
    setColumns(columnNames);
    setLoading(false);
  };

  const handleColumnChange = (event) => {
    const column = event.target.value;
    setSelectedColumn(column);

    // Generate preview of the column data
    if (column && parsedData.length > 0) {
      // Extract column data
      const previewData = parsedData
        .map((row) => row[column])
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).trim())
        .filter((value) => value !== "");

      setPreview(previewData.slice(0, 5)); // Show first 5 items
    }
  };

  const handleApply = () => {
    if (!selectedColumn) return;

    setLoading(true);

    try {
      // Extract the selected column data from parsed data
      const columnData = parsedData
        .map((row) => row[selectedColumn])
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).trim())
        .filter((value) => value !== "");

      onColumnSelected(columnData.join("\n"));
      setLoading(false);
      onClose();
    } catch (error) {
      setError(`Error extracting column data: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Excel/CSV File</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ marginBottom: "1rem" }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {columns.length > 0 && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Column</InputLabel>
              <Select
                value={selectedColumn}
                onChange={handleColumnChange}
                label="Select Column"
              >
                {columns.map((column) => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {preview.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Preview:</Typography>
              <Box
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#333" : "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                {preview.map((item, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      color: theme.palette.mode === "dark" ? "#fff" : "#333",
                      fontFamily: "monospace",
                    }}
                  >
                    {item}
                  </Typography>
                ))}
                {preview.length > 0 && (
                  <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                    sx={{ mt: 1 }}
                  >
                    ... and more
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          color="primary"
          variant="contained"
          disabled={!selectedColumn || loading}
        >
          Import Column
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelCsvImportDialog;
