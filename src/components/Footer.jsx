import React from "react";
import { Box, Typography, Divider } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ mt: 6, pb: 3 }}>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} List Comparison Tool. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
