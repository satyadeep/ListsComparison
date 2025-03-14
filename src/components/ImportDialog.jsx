import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { readFile } from "../utils/fileUtils";

const ImportDialog = ({ open, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetList, setTargetList] = useState("new");
  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a file to import");
      return;
    }

    setLoading(true);
    try {
      const data = await readFile(selectedFile);
      onImport(data, targetList);
      handleClose();
    } catch (err) {
      setError(`Error importing file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setLoading(false);
    setTargetList("new");
    onClose();
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Import Data
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.xlsx,.xls,.txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={triggerFileSelect}
            disabled={loading}
            fullWidth
          >
            {selectedFile ? `Selected: ${selectedFile.name}` : "Select File"}
          </Button>

          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 1, textAlign: "center" }}
          >
            Supported formats: CSV, JSON, Excel (.xlsx/.xls), and plain text
          </Typography>
        </Box>

        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <FormLabel component="legend">Import to:</FormLabel>
          <RadioGroup
            value={targetList}
            onChange={(e) => setTargetList(e.target.value)}
          >
            <FormControlLabel
              value="new"
              control={<Radio />}
              label="Create new list"
            />
            <FormControlLabel
              value="1"
              control={<Radio />}
              label="Import to List 1"
            />
            <FormControlLabel
              value="2"
              control={<Radio />}
              label="Import to List 2"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!selectedFile || loading}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
