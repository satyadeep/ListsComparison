import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllConfigurations, deleteConfiguration } from "../utils/dbUtils";

const ConfigManager = ({ onSave, onLoad }) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configurations, setConfigurations] = useState([]);

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const handleLoadClick = async () => {
    setLoadDialogOpen(true);
    try {
      const configs = await getAllConfigurations();
      setConfigurations(configs);
    } catch (error) {
      console.error("Failed to load configurations:", error);
    }
  };

  const handleSave = () => {
    if (configName.trim()) {
      onSave(configName.trim());
      setSaveDialogOpen(false);
      setConfigName("");
    }
  };

  const handleLoad = (config) => {
    onLoad(config);
    setLoadDialogOpen(false);
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation(); // Prevent loading the configuration when deleting
    try {
      await deleteConfiguration(id);
      const updatedConfigs = configurations.filter(
        (config) => config.id !== id
      );
      setConfigurations(updatedConfigs);
    } catch (error) {
      console.error("Failed to delete configuration:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Save current configuration">
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveClick}
            size="medium"
          >
            Save
          </Button>
        </Tooltip>
        <Tooltip title="Load saved configuration">
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={handleLoadClick}
            size="medium"
          >
            Load
          </Button>
        </Tooltip>
      </Box>

      {/* Save Configuration Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Configuration Name"
            type="text"
            fullWidth
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Configuration Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)}>
        <DialogTitle>Load Configuration</DialogTitle>
        <DialogContent>
          {configurations.length === 0 ? (
            <Box sx={{ py: 2 }}>No saved configurations found.</Box>
          ) : (
            <List>
              {configurations.map((config) => (
                <ListItem
                  button
                  key={config.id}
                  onClick={() => handleLoad(config)}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => handleDelete(config.id, e)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={config.name}
                    secondary={new Date(config.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfigManager;
