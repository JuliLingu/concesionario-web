"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Box, Typography } from "@mui/material";

export default function LoginPage() {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a0a0b', px: 2, pt: 16, pb: 8, overflow: 'hidden' }}>
      {/* Decorative Background Elements */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(194,65,12,0.05), transparent 50%)' }} />
      
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 450, zIndex: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.6em', color: 'primary.main', opacity: 0.8, mb: 2 }}>
            Acceso Exclusivo
          </Typography>
          <Typography variant="h1" sx={{ fontSize: '3.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'white', textTransform: 'uppercase', lineHeight: 1, mb: 1 }}>
            Login<Typography component="span" sx={{ color: 'primary.main', fontSize: 'inherit', fontWeight: 'inherit' }}>.</Typography>
          </Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>
            The Kinetic Gallery Experience
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: '1px', borderRadius: 1, backdropFilter: 'blur(4px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
           <Box sx={{ bgcolor: 'background.paper', p: { xs: 5, md: 6 }, borderRadius: 1 }}>
              <LoginForm />
           </Box>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)' }}>
            Est. 2024 &copy; JBJ Automotores
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}