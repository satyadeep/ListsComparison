import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import ThemeToggle from "./ThemeToggle";
import ImportExportButtons from "./ImportExportButtons";
import ConfigManager from "./ConfigManager";

const AppHeader = ({
  onSaveConfiguration,
  onLoadConfiguration,
  onImport,
  onExport,
}) => {
  return (
    <AppBar position="static" color="primary" sx={{ mb: 4, zIndex: 1300 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <Typography variant="h5">List Comparison Tool</Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            zIndex: 1400,
            position: "relative",
          }}
        >
          <ThemeToggle />
          <ImportExportButtons onImport={onImport} onExport={onExport} />
          <ConfigManager
            onSave={onSaveConfiguration}
            onLoad={onLoadConfiguration}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
