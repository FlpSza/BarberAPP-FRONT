// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Barbeiros from './pages/Barbeiros';
import Servicos from './pages/Servicos';
import Agendamentos from './pages/Agendamentos';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Pagamentos from './pages/Pagamentos';
import Login from './pages/Login';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513', // Marrom
    },
    secondary: {
      main: '#DAA520', // Dourado
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="barbeiros" element={<Barbeiros />} />
                <Route path="servicos" element={<Servicos />} />
                <Route path="agendamentos" element={<Agendamentos />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="vendas" element={<Vendas />} />
                <Route path="pagamentos" element={<Pagamentos />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;