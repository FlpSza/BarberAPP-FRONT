// src/pages/Barbeiros.js
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
  Chip,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ContentCut,
  Schedule,
  Phone,
  Person,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const diasSemana = [
  { value: 'dom', label: 'Domingo' },
  { value: 'seg', label: 'Segunda' },
  { value: 'ter', label: 'Terça' },
  { value: 'qua', label: 'Quarta' },
  { value: 'qui', label: 'Quinta' },
  { value: 'sex', label: 'Sexta' },
  { value: 'sab', label: 'Sábado' }
];

export default function Barbeiros() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState(null);
  const [diasTrabalho, setDiasTrabalho] = useState([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    loadBarbeiros();
  }, []);

  const loadBarbeiros = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbeiros');
      setBarbeiros(response.data.barbeiros || []);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
      // Mock data para demonstração
      setBarbeiros([
        {
          id: 1,
          nome: 'Carlos Silva',
          telefone: '(11) 99999-9999',
          especialidades: 'Cortes masculinos, Barba, Design de sobrancelha',
          horarioInicio: '08:00:00',
          horarioFim: '18:00:00',
          diasTrabalho: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
          dataContratacao: '2023-01-15',
          ativo: true
        },
        {
          id: 2,
          nome: 'Roberto Santos',
          telefone: '(11) 88888-8888',
          especialidades: 'Cortes modernos, Tratamentos capilares',
          horarioInicio: '09:00:00',
          horarioFim: '17:00:00',
          diasTrabalho: ['ter', 'qua', 'qui', 'sex', 'sab'],
          dataContratacao: '2023-03-10',
          ativo: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (barbeiro = null) => {
    setEditingBarbeiro(barbeiro);
    if (barbeiro) {
      reset({
        ...barbeiro,
        horarioInicio: barbeiro.horarioInicio?.substring(0, 5),
        horarioFim: barbeiro.horarioFim?.substring(0, 5),
        dataContratacao: barbeiro.dataContratacao
      });
      setDiasTrabalho(barbeiro.diasTrabalho || []);
    } else {
      reset({
        nome: '',
        telefone: '',
        especialidades: '',
        horarioInicio: '08:00',
        horarioFim: '18:00',
        dataContratacao: ''
      });
      setDiasTrabalho(['seg', 'ter', 'qua', 'qui', 'sex', 'sab']);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBarbeiro(null);
    setDiasTrabalho([]);
    reset();
  };

  const handleDiaTrabalhoChange = (dia) => {
    const newDias = diasTrabalho.includes(dia)
      ? diasTrabalho.filter(d => d !== dia)
      : [...diasTrabalho, dia];
    setDiasTrabalho(newDias);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        diasTrabalho,
        horarioInicio: data.horarioInicio + ':00',
        horarioFim: data.horarioFim + ':00'
      };

      if (editingBarbeiro) {
        await api.put(`/barbeiros/${editingBarbeiro.id}`, payload);
      } else {
        await api.post('/barbeiros', payload);
      }
      
      handleCloseDialog();
      loadBarbeiros();
    } catch (error) {
      console.error('Erro ao salvar barbeiro:', error);
      alert('Erro ao salvar barbeiro. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este barbeiro?')) {
      try {
        await api.delete(`/barbeiros/${id}`);
        loadBarbeiros();
      } catch (error) {
        console.error('Erro ao excluir barbeiro:', error);
        alert('Erro ao excluir barbeiro. Tente novamente.');
      }
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatDiasTrabalho = (dias) => {
    if (!dias || dias.length === 0) return '-';
    const diasFormatados = dias.map(dia => {
      const diaObj = diasSemana.find(d => d.value === dia);
      return diaObj ? diaObj.label.substring(0, 3) : dia;
    });
    return diasFormatados.join(', ');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Barbeiros
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Barbeiro
        </Button>
      </Box>

      {/* Cards de Barbeiros */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {barbeiros.map((barbeiro) => (
          <Grid item xs={12} md={6} lg={4} key={barbeiro.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ContentCut />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6">
                      {barbeiro.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {barbeiro.telefone}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(barbeiro)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(barbeiro.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Especialidades:</strong> {barbeiro.especialidades || '-'}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Horário:</strong> {formatTime(barbeiro.horarioInicio)} às {formatTime(barbeiro.horarioFim)}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Dias:</strong> {formatDiasTrabalho(barbeiro.diasTrabalho)}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={barbeiro.ativo ? 'Ativo' : 'Inativo'}
                    color={barbeiro.ativo ? 'success' : 'default'}
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Desde {new Date(barbeiro.dataContratacao).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabela de Barbeiros */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Dias de Trabalho</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={120}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barbeiros.map((barbeiro) => (
              <TableRow key={barbeiro.id}>
                <TableCell>{barbeiro.nome}</TableCell>
                <TableCell>{barbeiro.telefone}</TableCell>
                <TableCell>
                  {formatTime(barbeiro.horarioInicio)} - {formatTime(barbeiro.horarioFim)}
                </TableCell>
                <TableCell>{formatDiasTrabalho(barbeiro.diasTrabalho)}</TableCell>
                <TableCell>
                  <Chip
                    label={barbeiro.ativo ? 'Ativo' : 'Inativo'}
                    color={barbeiro.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(barbeiro)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(barbeiro.id)}
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
            {editingBarbeiro ? 'Editar Barbeiro' : 'Novo Barbeiro'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  {...register('telefone', { required: 'Telefone é obrigatório' })}
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Especialidades"
                  multiline
                  rows={2}
                  {...register('especialidades')}
                  placeholder="Ex: Cortes masculinos, Barba, Design de sobrancelha"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Horário de Início"
                  type="time"
                  {...register('horarioInicio')}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Horário de Fim"
                  type="time"
                  {...register('horarioFim')}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data de Contratação"
                  type="date"
                  {...register('dataContratacao')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Dias de Trabalho:
                </Typography>
                <FormGroup row>
                  {diasSemana.map((dia) => (
                    <FormControlLabel
                      key={dia.value}
                      control={
                        <Checkbox
                          checked={diasTrabalho.includes(dia.value)}
                          onChange={() => handleDiaTrabalhoChange(dia.value)}
                        />
                      }
                      label={dia.label}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingBarbeiro ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}