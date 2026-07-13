"use client";

import { useState, useTransition } from "react";
import {
  Box, Container, Typography, TextField, Button,
  Paper, Stack, Alert, Grid, InputAdornment
} from "@mui/material";
import { Settings, Save, Phone, Mail, MapPin, Building2, DollarSign, Clock } from "lucide-react";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import { updateConfiguracion } from "@/actions/configuracion";
import Link from "next/link";

interface SettingsClientProps {
  configuracion: any;
}

export const SettingsClient = ({ configuracion }: SettingsClientProps) => {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      nombreConcesionaria: formData.get("nombreConcesionaria"),
      telefono: formData.get("telefono"),
      email: formData.get("email"),
      direccion: formData.get("direccion"),
      facebookUrl: formData.get("facebookUrl"),
      instagramUrl: formData.get("instagramUrl"),
      horariosAtencion: formData.get("horariosAtencion"),
      cotizacionDolar: formData.get("cotizacionDolar") || null,
    };

    startTransition(async () => {
      const result = await updateConfiguracion(data);
      if (result.success) {
        setStatus({ type: "success", message: "Configuración actualizada correctamente." });
      } else {
        setStatus({ type: "error", message: result.error || "Ocurrió un error inesperado." });
      }
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 16, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Settings size={32} color="#c2410c" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'primary.main', mb: 1 }}>
              Panel de Control
            </Typography>
            <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5 }}>
              Configuración
            </Typography>
          </Box>
        </Box>

        {status.type && (
          <Alert severity={status.type} sx={{ mb: 4 }}>
            {status.message}
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Información Principal */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Building2 size={20} color="#c2410c" /> Información de la Concesionaria
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Nombre de la Concesionaria"
                    name="nombreConcesionaria"
                    defaultValue={configuracion.nombreConcesionaria}
                    required
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Building2 size={18} /></InputAdornment>,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    defaultValue={configuracion.telefono}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment>,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    defaultValue={configuracion.email}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment>,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    defaultValue={configuracion.direccion}
                    multiline
                    rows={2}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><MapPin size={18} /></InputAdornment>,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Horarios de Atención"
                    name="horariosAtencion"
                    defaultValue={configuracion.horariosAtencion}
                    placeholder="Ej: Lun — Vie: 09:00 — 19:00"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Clock size={18} /></InputAdornment>,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Cotización del Dólar (ARS)"
                    name="cotizacionDolar"
                    type="number"
                    defaultValue={configuracion.cotizacionDolar}
                    helperText="Se utilizará para mostrar los precios en pesos argentinos"
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><DollarSign size={18} /></InputAdornment>,
                      }
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* Redes Sociales */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FacebookIcon sx={{ fontSize: 20, color: "#c2410c" }} /> Redes Sociales
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="URL de Facebook"
                    name="facebookUrl"
                    defaultValue={configuracion.facebookUrl}
                    placeholder="https://facebook.com/..."
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><FacebookIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="URL de Instagram"
                    name="instagramUrl"
                    defaultValue={configuracion.instagramUrl}
                    placeholder="https://instagram.com/..."
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><InstagramIcon sx={{ fontSize: 18 }} /></InputAdornment>,
                      }
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Acciones */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              size="large"
              sx={{ fontWeight: 700 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isPending}
              startIcon={<Save size={20} />}
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
                '&:hover': {
                  background: "linear-gradient(135deg, #9a3412 0%, #c2410c 100%)",
                }
              }}
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Box>
        </form>

      </Container>
    </Box>
  );
};
