import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
} from '@mui/material';
import {
  People,
  Event,
  AttachMoney,
  ContentCut,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import api from '../services/api';

// Componente de Card de Estatística
function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

// Componente de Status do Agendamento
function StatusChip({ status }) {
  const statusConfig = {
    'agendado': { color: 'primary', icon: <Schedule />, label: 'Agendado' },
    'em_andamento': { color: 'warning', icon: <Schedule />, label: 'Em Andamento' },
    'concluido': { color: 'success', icon: <CheckCircle />, label: 'Concluído' },
    'cancelado': { color: 'error', icon: <Cancel />, label: 'Cancelado' }
  };

  const config = statusConfig[status] || statusConfig['agendado'];

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="outlined"
      size="small"
    />
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    agendamentosHoje: 0,
    vendaMes: 0,
    servicosRealizados: 0
  });
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const [clientesRes, agendamentosRes, vendasRes] = await Promise.all([
        api.get('/clientes?limit=1'),
        api.get('/agendamentos/hoje'),
        api.get('/vendas/mes-atual')
      ]);

      setStats({
        totalClientes: clientesRes.data.total || 0,
        agendamentosHoje: agendamentosRes.data.length || 0,
        vendaMes: vendasRes.data.total || 0,
        servicosRealizados: agendamentosRes.data.filter(a => a.status === 'concluido').length || 0
      });

      setAgendamentosHoje(agendamentosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Em caso de erro, usar dados mock para demonstração
      setStats({
        totalClientes: 150,
        agendamentosHoje: 8,
        vendaMes: 1500.00,
        servicosRealizados: 45
      });

      // Mock de agendamentos para demonstração
      setAgendamentosHoje([
        {
          id: 1,
          horario: '09:00',
          cliente: { nome: 'João Silva' },
          barbeiro: { nome: 'Carlos' },
          servico: { nome: 'Corte + Barba' },
          status: 'agendado'
        },
        {
          id: 2,
          horario: '10:30',
          cliente: { nome: 'Pedro Santos' },
          barbeiro: { nome: 'Roberto' },
          servico: { nome: 'Corte Masculino' },
          status: 'em_andamento'
        },
        {
          id: 3,
          horario: '14:00',
          cliente: { nome: 'Lucas Oliveira' },
          barbeiro: { nome: 'Carlos' },
          servico: { nome: 'Barba' },
          status: 'agendado'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Clientes"
            value={stats.totalClientes}
            icon={<People />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Agendamentos Hoje"
            value={stats.agendamentosHoje}
            icon={<Event />}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Faturamento do Mês"
            value={formatCurrency(stats.vendaMes)}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Serviços Realizados"
            value={stats.servicosRealizados}
            icon={<ContentCut />}
            color="info"
          />
        </Grid>

        {/* Agendamentos de Hoje */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Agendamentos de Hoje
            </Typography>
            {agendamentosHoje.length === 0 ? (
              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                Nenhum agendamento para hoje
              </Typography>
            ) : (
              <List>
                {agendamentosHoje.map((agendamento) => (
                  <ListItem key={agendamento.id} divider>
                    <ListItemIcon>
                      <Schedule color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">
                            {agendamento.horario} - {agendamento.cliente.nome}
                          </Typography>
                          <StatusChip status={agendamento.status} />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          {agendamento.servico.nome} com {agendamento.barbeiro.nome}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Resumo Rápido */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Resumo Rápido
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Crescimento"
                  secondary="↗️ 15% este mês"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <People color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Novos Clientes"
                  secondary="12 esta semana"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Event color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary="Taxa de Ocupação"
                  secondary="85% hoje"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}