import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import * as XLSX from "xlsx";

const ExcelCsvImportDialog = ({ open, onClose, onColumnSelected }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const theme = useTheme();

  // Added state for worksheet handling
  const [worksheets, setWorksheets] = useState([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState("");

  const handleFileChange = async (event) => {
    setErrorMessage("");
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      setFile(null);
      setColumns([]);
      setWorksheets([]);
      setSelectedWorksheet("");
      return;
    }

    // Check file type
    const fileType = selectedFile.type;
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv",
      "", // Some browsers may not set a type for CSV files
    ];

    if (
      !validTypes.includes(fileType) &&
      !selectedFile.name.endsWith(".csv") &&
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      setErrorMessage("Please upload a valid Excel or CSV file.");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });

          // Extract worksheet names
          const worksheetNames = workbook.SheetNames;
          setWorksheets(worksheetNames);

          // Set the first worksheet as selected by default
          if (worksheetNames.length > 0) {
            setSelectedWorksheet(worksheetNames[0]);

            // Load columns from the first worksheet
            loadWorksheetColumns(workbook, worksheetNames[0]);
          } else {
            setErrorMessage("No worksheets found in the file.");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error parsing file:", error);
          setErrorMessage(
            "Error parsing the file. Make sure it's a valid Excel/CSV file."
          );
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage("Error reading the file.");
        setLoading(false);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("File processing error:", error);
      setErrorMessage("Error processing the file.");
      setLoading(false);
    }
  };

  // Function to load columns from a specific worksheet
  const loadWorksheetColumns = (workbook, sheetName) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Get column headers and format them
      if (jsonData.length > 0) {
        const headers = jsonData[0];
        const columnOptions = headers.map((header, index) => ({
          label: header || `Column ${index + 1}`,
          value: index,
        }));
        setColumns(columnOptions);

        // Automatically select the first column
        if (columnOptions.length > 0) {
          setSelectedColumn(columnOptions[0].value);
        }
      } else {
        setErrorMessage("No data found in the selected worksheet.");
      }
    } catch (error) {
      console.error("Error loading worksheet:", error);
      setErrorMessage(`Error loading worksheet "${sheetName}".`);
    } finally {
      setLoading(false);
    }
  };

  // Handle worksheet change
  const handleWorksheetChange = (event) => {
    const newWorksheet = event.target.value;
    setSelectedWorksheet(newWorksheet);
    setLoading(true);

    try {
      // Re-read the file to get the new worksheet data
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });

          // Load columns from the selected worksheet
          loadWorksheetColumns(workbook, newWorksheet);
        } catch (error) {
          console.error("Error parsing file:", error);
          setErrorMessage("Error parsing the file when changing worksheet.");
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage("Error reading the file when changing worksheet.");
        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Worksheet change error:", error);
      setErrorMessage("Error changing worksheet.");
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || selectedColumn === "" || !selectedWorksheet) {
      setErrorMessage("Please select a file, worksheet, and column first.");
      return;
    }

    setProcessing(true);

    try {
      // Use setTimeout to ensure the UI updates with the processing state
      setTimeout(async () => {
        try {
          const reader = new FileReader();

          reader.onload = (e) => {
            try {
              const data = e.target.result;
              const workbook = XLSX.read(data, { type: "array" });
              const worksheet = workbook.Sheets[selectedWorksheet];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
              });

              // Extract values from the selected column
              const columnData = [];
              for (let i = 1; i < jsonData.length; i++) {
                // Start from 1 to skip header row
                const row = jsonData[i];
                if (row && row[selectedColumn] !== undefined) {
                  const value = row[selectedColumn];
                  if (value !== null && value !== "") {
                    columnData.push(value.toString());
                  }
                }
              }

              // Send the data back to the parent component
              onColumnSelected(columnData.join("\n"));
              handleClose();
            } catch (error) {
              console.error("Error extracting column data:", error);
              setErrorMessage("Error extracting column data from the file.");
            } finally {
              setProcessing(false);
            }
          };

          reader.onerror = () => {
            setErrorMessage("Error reading the file during import.");
            setProcessing(false);
          };

          reader.readAsArrayBuffer(file);
        } catch (error) {
          console.error("Import error:", error);
          setErrorMessage("Error during import. Please try again.");
          setProcessing(false);
        }
      }, 500); // Small delay to ensure UI updates before heavy processing
    } catch (error) {
      console.error("Unexpected import error:", error);
      setErrorMessage("Unexpected error during import.");
      setProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setFile(null);
    setColumns([]);
    setSelectedColumn("");
    setWorksheets([]);
    setSelectedWorksheet("");
    setErrorMessage("");
    setLoading(false);
    setProcessing(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={processing ? null : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Import from Excel/CSV</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ position: "relative" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Excel/CSV file:
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={loading || processing}
              style={{ marginTop: 8 }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <>
              {/* Worksheet selector */}
              {worksheets.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="worksheet-select-label">
                    Select Worksheet
                  </InputLabel>
                  <Select
                    labelId="worksheet-select-label"
                    value={selectedWorksheet}
                    onChange={handleWorksheetChange}
                    label="Select Worksheet"
                    disabled={processing}
                  >
                    {worksheets.map((worksheet) => (
                      <MenuItem key={worksheet} value={worksheet}>
                        {worksheet}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Column selector */}
              {columns.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="column-select-label">
                    Select Column
                  </InputLabel>
                  <Select
                    labelId="column-select-label"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    label="Select Column"
                    disabled={processing}
                  >
                    {columns.map((column) => (
                      <MenuItem key={column.value} value={column.value}>
                        {column.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

          {/* Processing overlay */}
          {processing && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                zIndex: 10,
                backdropFilter: "blur(3px)",
                boxShadow: theme.shadows[5],
              }}
            >
              <CircularProgress size={40} sx={{ color: "white" }} />
              <Typography
                variant="body1"
                sx={{ color: "white", mt: 2, fontWeight: "medium" }}
              >
                Please wait while we process the data...
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "white", display: "block", mt: 1 }}
              >
                Calculating items and identifying duplicates
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          * The selected column's data will be imported into the list.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          color="primary"
          variant="contained"
          disabled={
            !file ||
            selectedColumn === "" ||
            !selectedWorksheet ||
            loading ||
            processing
          }
        >
          {processing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Import"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelCsvImportDialog;
