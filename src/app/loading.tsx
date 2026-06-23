"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        width: "100%",
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={4} color="primary" />
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
        Cargando...
      </Typography>
    </Box>
  );
}
