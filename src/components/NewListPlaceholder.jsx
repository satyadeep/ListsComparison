import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const NewListPlaceholder = ({ category }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 1, sm: 2 },
        position: "relative",
        borderLeft: "4px solid #1976d2",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(25, 118, 210, 0.08)"
            : "rgba(25, 118, 210, 0.04)",
        minHeight: "300px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h6">Creating new list...</Typography>
      </Box>

      {/* Textarea placeholder */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          minHeight: "180px",
        }}
      />

      {/* Action buttons placeholder */}
      <Box sx={{ height: "40px", mt: 1 }} />

      {/* Overlay */}
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
          zIndex: 10,
          borderRadius: "inherit",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="#1976d2"
              strokeWidth="3"
              strokeDasharray="75"
              strokeDashoffset="0"
              style={{
                animation: "spin 1s linear infinite",
                transformOrigin: "center",
              }}
            />
          </svg>
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Adding new list...
        </Typography>
        <Typography variant="body2">
          Please wait while we prepare your new list
        </Typography>
        <style jsx="true">{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Box>
    </Paper>
  );
};

export default NewListPlaceholder;
