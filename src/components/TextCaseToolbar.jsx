import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import AbcIcon from "@mui/icons-material/Abc";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";

const TextCaseToolbar = ({ listId, borderColor, onTransform }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 1,
        borderTop: `1px solid ${borderColor || "#ddd"}`,
        pt: 1,
      }}
    >
      <Tooltip title="UPPERCASE">
        <IconButton
          size="small"
          onClick={() => onTransform(listId, "uppercase")}
          sx={{ mx: 0.5 }}
        >
          <FormatSizeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="lowercase">
        <IconButton
          size="small"
          onClick={() => onTransform(listId, "lowercase")}
          sx={{ mx: 0.5 }}
        >
          <AbcIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sentence case">
        <IconButton
          size="small"
          onClick={() => onTransform(listId, "sentencecase")}
          sx={{ mx: 0.5 }}
        >
          <TextFormatIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="camelCase">
        <IconButton
          size="small"
          onClick={() => onTransform(listId, "camelcase")}
          sx={{ mx: 0.5 }}
        >
          <TextFieldsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="PascalCase">
        <IconButton
          size="small"
          onClick={() => onTransform(listId, "pascalcase")}
          sx={{ mx: 0.5 }}
        >
          <FormatColorTextIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TextCaseToolbar;
