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

  return (
    <>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Save Configuration">
          <Button
            startIcon={<SaveIcon />}
            variant="outlined"
            color="info"
            onClick={() => setSaveDialogOpen(true)}
            size="small"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.9)" }}
          >
            Save
          </Button>
        </Tooltip>

        <Tooltip title="Load Configuration">
          <Button
            startIcon={<FolderOpenIcon />}
            variant="outlined"
            color="info"
            onClick={handleClick}
            size="small"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.9)" }}
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
    </>
  );
};

export default ConfigManager;
