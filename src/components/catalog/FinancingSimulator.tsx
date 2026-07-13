"use client";

import { useState, useMemo } from "react";
import { Box, Button, Collapse, Slider, Stack, Typography } from "@mui/material";
import { Calculator } from "lucide-react";
import { FinancingForm } from "./FinancingForm";

interface Plan {
  id: string;
  nombre: string;
  cuotas: number;
  tasaAnual: number;
}

interface FinancingSimulatorProps {
  vehiculoId: string;
  precioOriginal: number;
  cotizacionDolar?: number | null;
  planes: Plan[];
}

export const FinancingSimulator = ({ vehiculoId, precioOriginal, cotizacionDolar, planes }: FinancingSimulatorProps) => {
  const precioArs = cotizacionDolar ? precioOriginal * cotizacionDolar : precioOriginal;
  
  const [anticipoPercent, setAnticipoPercent] = useState<number>(50);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(planes.length > 0 ? planes[0].id : null);
  const [showForm, setShowForm] = useState(false);

  const anticipoArs = (precioArs * anticipoPercent) / 100;
  
  const selectedPlan = planes.find(p => p.id === selectedPlanId) || planes[0];

  const cuotaMensual = useMemo(() => {
    if (!selectedPlan) return 0;
    const capitalAFinanciar = precioArs - anticipoArs;
    const tasaDecimal = selectedPlan.tasaAnual / 100;
    const años = selectedPlan.cuotas / 12;
    const totalAPagar = capitalAFinanciar + (capitalAFinanciar * tasaDecimal * años);
    return totalAPagar / selectedPlan.cuotas;
  }, [precioArs, anticipoArs, selectedPlan]);

  if (planes.length === 0) {
    return null; // No financing available
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(val);

  return (
    <Box sx={{
      bgcolor: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(194,65,12,0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={20} />
          </Box>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Simulador de Cuotas
          </Typography>
        </Stack>

        <Stack spacing={4}>
          <Box>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Tu Anticipo ({anticipoPercent}%)
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 900, color: 'text.primary' }}>
                {formatCurrency(anticipoArs)}
              </Typography>
            </Stack>
            <Slider
              value={anticipoPercent}
              onChange={(_, newVal) => setAnticipoPercent(newVal as number)}
              min={10}
              max={90}
              step={5}
              sx={{
                color: 'primary.main',
                height: 8,
                '& .MuiSlider-thumb': {
                  width: 24,
                  height: 24,
                  backgroundColor: '#fff',
                  border: '2px solid currentColor',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'inherit',
                  },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
              Plan de Financiación
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {planes.map(plan => (
                <Button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  variant={selectedPlanId === plan.id ? "contained" : "outlined"}
                  sx={{
                    borderRadius: 5,
                    px: 3,
                    py: 1,
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    ...(selectedPlanId === plan.id 
                      ? { bgcolor: 'text.primary', color: 'background.default', boxShadow: 'none', border: '1px solid transparent', '&:hover': { bgcolor: 'text.secondary', boxShadow: 'none' } }
                      : { color: 'text.secondary', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { color: 'text.primary', border: '1px solid rgba(255,255,255,0.3)', bgcolor: 'transparent' } }
                    )
                  }}
                >
                  {plan.cuotas} Cuotas
                </Button>
              ))}
            </Stack>
          </Box>

          <Box sx={{ bgcolor: '#0a0a0a', p: 3, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'primary.main', mb: 1 }}>
              Cuota Fija Mensual
            </Typography>
            <Typography sx={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'text.primary', lineHeight: 1 }}>
              {formatCurrency(cuotaMensual)}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500, mt: 1 }}>
              TNA: {selectedPlan?.tasaAnual}% (Interés Simple)
            </Typography>
          </Box>

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: 2,
                fontSize: '0.875rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Solicitar este crédito
            </Button>
          )}
        </Stack>
      </Box>

      <Collapse in={showForm}>
        <Box sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 3 }}>
            Completá tus datos
          </Typography>
          <FinancingForm 
            vehiculoId={vehiculoId} 
            anticipo={anticipoArs} 
            cuotas={selectedPlan?.cuotas || 12} 
          />
        </Box>
      </Collapse>
    </Box>
  );
};
