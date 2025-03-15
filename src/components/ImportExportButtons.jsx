import React, { useRef } from "react";
import { Box, Tooltip, Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ExportMenu from "./ExportMenu";

const ImportExportButtons = ({ onImport, onExport, onExportExcel }) => {
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
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
          startIcon={<FileUploadIcon />}
          onClick={() => fileInputRef.current.click()}
          size="medium"
        >
          Import
        </Button>
      </Tooltip>

      <ExportMenu onExportText={onExport} onExportExcel={onExportExcel} />
    </Box>
  );
};

export default ImportExportButtons;
