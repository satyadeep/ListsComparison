import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllConfigurations, deleteConfiguration } from "../utils/dbUtils";
import SaveConfigDialog from "./SaveConfigDialog";

const ConfigManager = ({ onSave, onLoad }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");

  // Fetch configurations when component mounts
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Load all saved configurations
  const loadConfigurations = async () => {
    try {
      const allConfigs = await getAllConfigurations();
      setConfigs(allConfigs);
    } catch (error) {
      console.error("Failed to load configurations:", error);
    }
  };

  // Handle opening menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Refresh configurations list when opening menu
    loadConfigurations();
  };

  // Handle closing menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle loading a configuration
  const handleLoadConfig = (config) => {
    onLoad(config);
    handleClose();
  };

  // Handle deleting a configuration
  const handleDeleteConfig = async (id, event) => {
    event.stopPropagation(); // Prevent loading the configuration

    try {
      await deleteConfiguration(id);
      loadConfigurations(); // Refresh the list after deletion
    } catch (error) {
      console.error("Failed to delete configuration:", error);
    }
  };

  // Handle saving a configuration
  const handleSaveConfig = (name) => {
    onSave(name);
    setSaveDialogOpen(false);
    loadConfigurations(); // Refresh the list after saving
  };

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  const handleLoadClick = async () => {
    setLoadDialogOpen(true);
    try {
      const configs = await getAllConfigurations();
      setConfigs(configs);
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
      const updatedConfigs = configs.filter((config) => config.id !== id);
      setConfigs(updatedConfigs);
    } catch (error) {
      console.error("Failed to delete configuration:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Save Configuration">
          <Button
            startIcon={<SaveIcon />}
            variant="outlined"
            color="info"
            onClick={handleSaveClick}
            size="small"
            sx={{
              color: "inherit",
              borderColor: "inherit",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "inherit",
              },
            }}
          >
            Save
          </Button>
        </Tooltip>

        <Tooltip title="Load Configuration">
          <Button
            startIcon={<FolderOpenIcon />}
            variant="outlined"
            color="info"
            onClick={handleLoadClick}
            size="small"
            sx={{
              color: "inherit",
              borderColor: "inherit",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "inherit",
              },
            }}
            disabled={configs.length === 0}
          >
            Load
          </Button>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          zIndex: 9999, // Very high z-index to ensure it's on top
          "& .MuiPaper-root": {
            maxHeight: "300px",
            overflowY: "auto",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        MenuListProps={{
          sx: { zIndex: 9999 },
        }}
      >
        {configs.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No saved configurations</Typography>
          </MenuItem>
        ) : (
          configs
            .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp descending (newest first)
            .map((config) => (
              <MenuItem
                key={config.id}
                onClick={() => handleLoadConfig(config)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  minWidth: 200,
                  pr: 1,
                }}
              >
                <ListItemText
                  primary={config.name}
                  secondary={new Date(config.timestamp).toLocaleString()}
                />
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteConfig(config.id, e)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            ))
        )}
      </Menu>

      <SaveConfigDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveConfig}
      />

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
          {configs.length === 0 ? (
            <Box sx={{ py: 2 }}>No saved configurations found.</Box>
          ) : (
            <List>
              {configs.map((config) => (
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
