import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

/**
 * Debug component to help pinpoint tooltip rendering issues
 * Add this component temporarily to AppContent to test tooltip rendering
 */
const TooltipDebugger = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: 300,
        bgcolor: "#f5f5f5",
        mb: 2,
        p: 2,
        position: "relative",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Tooltip Debug Area
      </Typography>
      <Typography>
        Mouse position: x={mousePos.x}, y={mousePos.y}
      </Typography>
      <Button
        variant="contained"
        onClick={() => setShowTooltip(!showTooltip)}
        sx={{ mt: 2 }}
      >
        {showTooltip ? "Hide Tooltip" : "Show Tooltip"}
      </Button>

      {/* Test tooltip rendering */}
      {showTooltip && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            left: mousePos.x,
            top: mousePos.y - 100,
            padding: "12px",
            backgroundColor: "white",
            maxWidth: "200px",
            zIndex: 10000,
          }}
        >
          <Typography variant="body2">
            This is a test tooltip to verify positioning
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TooltipDebugger;
