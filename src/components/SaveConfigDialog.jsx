import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const SaveConfigDialog = ({ open, onClose, onSave }) => {
  const [configName, setConfigName] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    // Validate input
    if (!configName.trim()) {
      setError("Please enter a configuration name");
      return;
    }

    onSave(configName);
    setConfigName("");
    setError("");
  };

  const handleClose = () => {
    setConfigName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Save Configuration</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Configuration Name"
          type="text"
          fullWidth
          variant="outlined"
          value={configName}
          onChange={(e) => {
            setConfigName(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveConfigDialog;
