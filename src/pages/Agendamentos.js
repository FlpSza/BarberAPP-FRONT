import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  PlayArrow,
  Today,
  Event,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';

const statusConfig = {
  'agendado': { color: 'primary', label: 'Agendado', icon: <Event /> },
  'em_andamento': { color: 'warning', label: 'Em Andamento', icon: <PlayArrow /> },
  'concluido': { color: 'success', label: 'Concluído', icon: <CheckCircle /> },
  'cancelado': { color: 'error', label: 'Cancelado', icon: <Cancel /> }
};

function StatusChip({ status, onClick }) {
  const config = statusConfig[status] || statusConfig['agendado'];
  
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="outlined"
      size="small"
      onClick={onClick}
      clickable={!!onClick}
    />
  );
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tabValue, setTabValue] = useState(0);

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();

  useEffect(() => {
    loadAgendamentos();
    loadSelectOptions();
  }, [selectedDate, tabValue]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      
      let params = {
        data: selectedDate.format('YYYY-MM-DD')
      };
      
      if (tabValue === 1) params.status = 'agendado';
      if (tabValue === 2) params.status = 'em_andamento';
      if (tabValue === 3) params.status = 'concluido';
      
      const response = await api.get('/agendamentos', { params });
      setAgendamentos(response.data.agendamentos || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      // Mock data para demonstração
      setAgendamentos([
        {
          id: 1,
          dataAgendamento: selectedDate.format('YYYY-MM-DD'),
          horario: '09:00:00',
          status: 'agendado',
          cliente: { id: 1, nome: 'João Silva' },
          barbeiro: { id: 1, nome: 'Carlos' },
          servico: { id: 1, nome: 'Corte + Barba', preco: 35.00 },
          observacoes: 'Cliente prefere corte baixo'
        },
        {
          id: 2,
          dataAgendamento: selectedDate.format('YYYY-MM-DD'),
          horario: '10:30:00',
          status: 'em_andamento',
          cliente: { id: 2, nome: 'Pedro Santos' },
          barbeiro: { id: 1, nome: 'Carlos' },
          servico: { id: 2, nome: 'Corte Masculino', preco: 25.00 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectOptions = async () => {
    try {
      const [clientesRes, barbeirosRes, servicosRes] = await Promise.all([
        api.get('/clientes?limit=100'),
        api.get('/barbeiros?limit=50'),
        api.get('/servicos?limit=50')
      ]);
      
      setClientes(clientesRes.data.clientes || []);
      setBarbeiros(barbeirosRes.data.barbeiros || []);
      setServicos(servicosRes.data.servicos || []);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      // Mock data
      setClientes([
        { id: 1, nome: 'João Silva' },
        { id: 2, nome: 'Pedro Santos' },
        { id: 3, nome: 'Lucas Oliveira' }
      ]);
      setBarbeiros([
        { id: 1, nome: 'Carlos' },
        { id: 2, nome: 'Roberto' }
      ]);
      setServicos([
        { id: 1, nome: 'Corte Masculino', preco: 25.00, duracaoMinutos: 30 },
        { id: 2, nome: 'Barba', preco: 15.00, duracaoMinutos: 20 },
        { id: 3, nome: 'Corte + Barba', preco: 35.00, duracaoMinutos: 45 }
      ]);
    }
  };

  const handleOpenDialog = (agendamento = null) => {
    setEditingAgendamento(agendamento);
    if (agendamento) {
      reset({
        ...agendamento,
        dataAgendamento: dayjs(agendamento.dataAgendamento).format('YYYY-MM-DD'),
        horario: agendamento.horario.substring(0, 5),
        clienteId: agendamento.cliente.id,
        barbeiroId: agendamento.barbeiro.id,
        servicoId: agendamento.servico.id
      });
    } else {
      reset({
        dataAgendamento: selectedDate.format('YYYY-MM-DD'),
        horario: '09:00',
        clienteId: '',
        barbeiroId: '',
        servicoId: '',
        observacoes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAgendamento(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        dataAgendamento: dayjs(data.dataAgendamento).format('YYYY-MM-DD'),
        horario: data.horario + ':00'
      };

      if (editingAgendamento) {
        await api.put(`/agendamentos/${editingAgendamento.id}`, payload);
      } else {
        await api.post('/agendamentos', payload);
      }
      
      handleCloseDialog();
      loadAgendamentos();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento. Tente novamente.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status: newStatus });
      loadAgendamentos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await api.delete(`/agendamentos/${id}`);
        loadAgendamentos();
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        alert('Erro ao excluir agendamento. Tente novamente.');
      }
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusOptions = (currentStatus) => {
    const transitions = {
      'agendado': ['em_andamento', 'cancelado'],
      'em_andamento': ['concluido', 'cancelado'],
      'concluido': [],
      'cancelado': ['agendado']
    };
    return transitions[currentStatus] || [];
  };

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return agendamento.status === 'agendado';
    if (tabValue === 2) return agendamento.status === 'em_andamento';
    if (tabValue === 3) return agendamento.status === 'concluido';
    return true;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Agendamentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Agendamento
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <DatePicker
                label="Data"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Today />}
                onClick={() => setSelectedDate(dayjs())}
              >
                Hoje
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Todos" />
          <Tab label="Agendados" />
          <Tab label="Em Andamento" />
          <Tab label="Concluídos" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Horário</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Barbeiro</TableCell>
              <TableCell>Serviço</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={120}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAgendamentos.map((agendamento) => (
              <TableRow key={agendamento.id}>
                <TableCell>{formatTime(agendamento.horario)}</TableCell>
                <TableCell>{agendamento.cliente.nome}</TableCell>
                <TableCell>{agendamento.barbeiro.nome}</TableCell>
                <TableCell>{agendamento.servico.nome}</TableCell>
                <TableCell>{formatCurrency(agendamento.servico.preco)}</TableCell>
                <TableCell>
                  <StatusChip 
                    status={agendamento.status}
                    onClick={() => {
                      const options = getStatusOptions(agendamento.status);
                      if (options.length > 0) {
                        const newStatus = options[0];
                        handleStatusChange(agendamento.id, newStatus);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(agendamento)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(agendamento.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data"
                  type="date"
                  {...register('dataAgendamento', { required: 'Data é obrigatória' })}
                  error={!!errors.dataAgendamento}
                  helperText={errors.dataAgendamento?.message}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Horário"
                  type="time"
                  {...register('horario', { required: 'Horário é obrigatório' })}
                  error={!!errors.horario}
                  helperText={errors.horario?.message}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Cliente"
                  {...register('clienteId', { required: 'Cliente é obrigatório' })}
                  error={!!errors.clienteId}
                  helperText={errors.clienteId?.message}
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Barbeiro"
                  {...register('barbeiroId', { required: 'Barbeiro é obrigatório' })}
                  error={!!errors.barbeiroId}
                  helperText={errors.barbeiroId?.message}
                >
                  {barbeiros.map((barbeiro) => (
                    <MenuItem key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Serviço"
                  {...register('servicoId', { required: 'Serviço é obrigatório' })}
                  error={!!errors.servicoId}
                  helperText={errors.servicoId?.message}
                >
                  {servicos.map((servico) => (
                    <MenuItem key={servico.id} value={servico.id}>
                      {servico.nome} - {formatCurrency(servico.preco)} ({servico.duracaoMinutos}min)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  {...register('observacoes')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingAgendamento ? 'Atualizar' : 'Agendar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}