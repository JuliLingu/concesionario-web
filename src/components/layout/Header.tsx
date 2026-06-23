"use client";
import { motion } from "framer-motion";
import { Car, DoorOpen } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";
import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      <AppBar 
        position="static" 
        color="transparent" 
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255,255,255,0.80)',
          boxShadow: '0 20px 40px rgba(26,28,30,0.06)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
            <Car style={{ color: "#c2410c", width: 24, height: 24 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a1c1e', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              JBJ 
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Automotores
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            <Button component={Link} href="/" variant="text" sx={{ color: 'rgba(26,28,30,0.6)', '&:hover': { color: '#1a1c1e' } }}>
              Inicio
            </Button>
            <Button component={Link} href="/#nosotros" variant="text" sx={{ color: 'rgba(26,28,30,0.6)', '&:hover': { color: '#1a1c1e' } }}>
              Nosotros
            </Button>
            <Button component={Link} href="/#ubicacion" variant="text" sx={{ color: 'rgba(26,28,30,0.6)', '&:hover': { color: '#1a1c1e' } }}>
              Ubicación
            </Button>
            {session?.user?.role === "ADMIN" && (
              <Button component={Link} href="/dashboard" variant="text" sx={{ color: 'rgba(26,28,30,0.6)', '&:hover': { color: '#1a1c1e' } }}>
                Administrador
              </Button>
            )}
            <Button 
              component={Link} 
              href="/catalogo" 
              variant="contained" 
              disableElevation
              sx={{
                background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                color: "#ffffff",
                '&:hover': {
                  background: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
                }
              }}
            >
              Ver Vehículos
            </Button>
          </Box>

          {session ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1c1e', display: { xs: 'none', sm: 'block' } }}>
                {session.user?.name}
              </Typography>
              <form action={handleSignOut}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disableElevation
                  sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
                >
                  Salir
                </Button>
              </form>
            </Box>
          ) : (
            <Button
              component={Link}
              href="/login"
              variant="contained"
              disableElevation
              startIcon={<DoorOpen />}
              sx={{
                background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                color: "#ffffff",
                '&:hover': {
                  background: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
                }
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </motion.header>
  );
}
