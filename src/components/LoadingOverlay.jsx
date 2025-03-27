import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

const LoadingOverlay = ({
  message = "Processing...",
  subMessage = "Please wait",
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
      }}
    >
      <CircularProgress
        color="primary"
        size={40}
        thickness={4}
        sx={{ mb: 2 }}
      />
      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
        {message}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
        {subMessage}
      </Typography>
    </Box>
  );
};

export default LoadingOverlay;
