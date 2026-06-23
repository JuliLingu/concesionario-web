import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c2410c', // orange-700 / racing color
    },
    background: {
      default: '#0a0a0a', // very dark background
      paper: '#171717',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), sans-serif',
    h1: {
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2, // sharp edges for the kinetic feel
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
