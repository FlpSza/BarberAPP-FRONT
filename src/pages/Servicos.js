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
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  RoomService,
  AttachMoney,
  AccessTime,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadServicos();
  }, []);

    const loadServicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servicos');
      setServicos(response.data.servicos || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      // Mock data para demonstração
      setServicos([
        {
          id: 1,
          nome: 'Corte Masculino',
          descricao: 'Corte de cabelo masculino tradicional',
          preco: 25.00,
          duracaoMinutos: 30,
          ativo: true
        },
        {
          id: 2,
          nome: 'Barba',
          descricao: 'Aparar e modelar barba',
          preco: 15.00,
          duracaoMinutos: 20,
          ativo: true
        },
        {
          id: 3,
          nome: 'Corte + Barba',
          descricao: 'Corte de cabelo + barba',
          preco: 35.00,
          duracaoMinutos: 45,
          ativo: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (servico = null) => {
    setEditingServico(servico);
    if (servico) {
      reset(servico);
    } else {
      reset({
        nome: '',
        descricao: '',
        preco: '',
        duracaoMinutos: 30
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingServico(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        preco: parseFloat(data.preco),
        duracaoMinutos: parseInt(data.duracaoMinutos)
      };

      if (editingServico) {
        await api.put(`/servicos/${editingServico.id}`, payload);
      } else {
        await api.post('/servicos', payload);
      }
      
      handleCloseDialog();
      loadServicos();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert('Erro ao salvar serviço. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await api.delete(`/servicos/${id}`);
        loadServicos();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        alert('Erro ao excluir serviço. Tente novamente.');
      }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Serviços
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Serviço
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={120}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicos.map((servico) => (
              <TableRow key={servico.id}>
                <TableCell>{servico.nome}</TableCell>
                <TableCell>{servico.descricao}</TableCell>
                <TableCell>{formatCurrency(servico.preco)}</TableCell>
                <TableCell>{servico.duracaoMinutos} min</TableCell>
                <TableCell>
                  <Chip
                    label={servico.ativo ? 'Ativo' : 'Inativo'}
                    color={servico.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(servico)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(servico.id)}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RoomService />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  {...register('descricao')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preço"
                  type="number"
                  step="0.01"
                  {...register('preco', { 
                    required: 'Preço é obrigatório',
                    min: { value: 0.01, message: 'Preço deve ser maior que zero' }
                  })}
                  error={!!errors.preco}
                  helperText={errors.preco?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duração (minutos)"
                  type="number"
                  {...register('duracaoMinutos', { 
                    required: 'Duração é obrigatória',
                    min: { value: 1, message: 'Duração deve ser maior que zero' }
                  })}
                  error={!!errors.duracaoMinutos}
                  helperText={errors.duracaoMinutos?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingServico ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}