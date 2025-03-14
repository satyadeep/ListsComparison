import React, { useRef } from "react";
import { Button, Box, Tooltip } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const ImportExportButtons = ({ onImport, onExport }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      onImport(content);
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        accept=".txt,.csv,.json"
      />
      <Tooltip title="Import data from file">
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FileUploadIcon />}
          onClick={() => fileInputRef.current.click()}
          size="small"
        >
          Import
        </Button>
      </Tooltip>
      <Tooltip title="Export data to file">
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<FileDownloadIcon />}
          onClick={onExport}
          size="small"
        >
          Export
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ImportExportButtons;
