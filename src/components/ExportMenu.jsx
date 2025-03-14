import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import TableChartIcon from "@mui/icons-material/TableChart";

const ExportMenu = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Extract onExportText and onExportExcel with explicit logging
  const { onExportText, onExportExcel } = props;
  console.log("ExportMenu props:", props);
  console.log("onExportText type:", typeof onExportText);
  console.log("onExportExcel type:", typeof onExportExcel);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportText = () => {
    if (typeof onExportText === "function") {
      onExportText();
    } else {
      console.error("Export text function is not defined");
      alert("Text export functionality is not available");
    }
    handleClose();
  };

  const handleExportExcel = () => {
    if (typeof onExportExcel === "function") {
      onExportExcel();
    } else {
      console.error("Export Excel function is not defined");
      alert(
        "Excel export functionality requires xlsx library. Please install with: npm install xlsx"
      );
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="Export data">
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleClick}
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
          Export
        </Button>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleExportText}>
          <ListItemIcon>
            <TextSnippetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Text</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;
