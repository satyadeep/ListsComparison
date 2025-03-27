import React from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

const ListPlaceholder = ({ active, category }) => {
  if (!active) return null;

  return (
    <Paper
      elevation={2}
      sx={{
        height: "200px",
        width: "100%",
        position: "relative",
        bgcolor: "background.paper",
        border: "1px dashed #aaa",
        p: 2,
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(2px)",
          zIndex: 2,
          borderRadius: "4px",
        }}
      >
        <CircularProgress size={40} color="primary" />
        <Typography sx={{ mt: 2, color: "white", fontWeight: "medium" }}>
          Creating new {category} list...
        </Typography>
      </Box>
    </Paper>
  );
};

export default ListPlaceholder;
