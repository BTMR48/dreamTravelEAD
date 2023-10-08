import React from "react";
import { Box, Typography } from "@mui/material";

import "./Footer.css";

function Footer() {
  return (
    <Box className="footer-root">
      <Typography variant="body2" align="center" className="footer-text">
        © 2023 Dream Travels. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Footer;
