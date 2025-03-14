import React, { useRef } from "react";
import { Button, Stack, Tooltip } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";

const ImportExportButtons = ({ onImport, onExport }) => {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        onImport(content);
      } catch (error) {
        console.error("Error importing file:", error);
        alert("Failed to import file. Please ensure it is a valid text file.");
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be selected again if needed
    event.target.value = "";
  };

  const handleExport = () => {
    onExport();
  };

  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Import from file">
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={handleImportClick}
          size="small"
          sx={{ bgcolor: "rgba(255, 255, 255, 0.9)" }}
        >
          Import
        </Button>
      </Tooltip>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".txt,.csv,.text"
      />

      <Tooltip title="Export to file">
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          size="small"
          sx={{ bgcolor: "rgba(255, 255, 255, 0.9)" }}
        >
          Export
        </Button>
      </Tooltip>
    </Stack>
  );
};

export default ImportExportButtons;
