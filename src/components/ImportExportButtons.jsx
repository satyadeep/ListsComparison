import React, { useRef } from "react";
import { Box, Tooltip, Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ExportMenu from "./ExportMenu";

const ImportExportButtons = (props) => {
  const fileInputRef = useRef(null);

  // Extract props with explicit logging
  const { onImport, onExport, onExportExcel } = props;
  console.log("ImportExportButtons props:", props);
  console.log("onImport type:", typeof onImport);
  console.log("onExport type:", typeof onExport);
  console.log("onExportExcel type:", typeof onExportExcel);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (typeof onImport === "function") {
        onImport(content);
      }
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
          sx={{
            color: "inherit",
            borderColor: "inherit",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "inherit",
            },
          }}
        >
          Import
        </Button>
      </Tooltip>

      {/* Pass both export functions to ExportMenu */}
      <ExportMenu onExportText={onExport} onExportExcel={onExportExcel} />
    </Box>
  );
};

export default ImportExportButtons;
