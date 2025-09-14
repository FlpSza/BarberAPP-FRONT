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
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Inventory,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      // Mock data para demonstração
      setProdutos([
        {
          id: 1,
          nome: 'Pomada Modeladora',
          descricao: 'Pomada para modelar cabelo',
          preco: 18.00,
          estoque: 20,
          estoqueMinimo: 5,
          categoria: 'Cabelo',
          ativo: true
        },
        {
          id: 2,
          nome: 'Óleo para Barba',
          descricao: 'Óleo hidratante para barba',
          preco: 22.00,
          estoque: 3,
          estoqueMinimo: 5,
          categoria: 'Barba',
          ativo: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (produto = null) => {
    setEditingProduto(produto);
    if (produto) {
      reset(produto);
    } else {
      reset({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        estoqueMinimo: 5,
        categoria: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduto(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        preco: parseFloat(data.preco),
        estoque: parseInt(data.estoque),
        estoqueMinimo: parseInt(data.estoqueMinimo)
      };

      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}`, payload);
      } else {
        await api.post('/produtos', payload);
      }
      
      handleCloseDialog();
      loadProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        loadProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEstoqueStatus = (estoque, estoqueMinimo) => {
    if (estoque === 0) {
      return { color: 'error', label: 'Sem Estoque' };
    } else if (estoque <= estoqueMinimo) {
      return { color: 'warning', label: 'Estoque Baixo' };
    } else {
      return { color: 'success', label: 'Em Estoque' };
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Produto
        </Button>
      </Box>

      {/* Alertas de Estoque */}
      {produtos.filter(p => p.estoque <= p.estoqueMinimo).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Atenção!</strong> {produtos.filter(p => p.estoque <= p.estoqueMinimo).length} produto(s) 
            com estoque baixo ou zerado.
          </Typography>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Estoque</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={120}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((produto) => {
              const estoqueStatus = getEstoqueStatus(produto.estoque, produto.estoqueMinimo);
              return (
                <TableRow key={produto.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {produto.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {produto.descricao}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{produto.categoria}</TableCell>
                  <TableCell>{formatCurrency(produto.preco)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {produto.estoque}
                      {produto.estoque <= produto.estoqueMinimo && (
                        <Warning color="warning" fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={estoqueStatus.label}
                      color={estoqueStatus.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(produto)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(produto.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingProduto ? 'Editar Produto' : 'Novo Produto'}
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
                        <Inventory />
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
                  rows={2}
                  {...register('descricao')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Categoria"
                  {...register('categoria', { required: 'Categoria é obrigatória' })}
                  error={!!errors.categoria}
                  helperText={errors.categoria?.message}
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
                  label="Estoque Atual"
                  type="number"
                  {...register('estoque', { 
                    required: 'Estoque é obrigatório',
                    min: { value: 0, message: 'Estoque não pode ser negativo' }
                  })}
                  error={!!errors.estoque}
                  helperText={errors.estoque?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estoque Mínimo"
                  type="number"
                  {...register('estoqueMinimo', { 
                    required: 'Estoque mínimo é obrigatório',
                    min: { value: 0, message: 'Estoque mínimo não pode ser negativo' }
                  })}
                  error={!!errors.estoqueMinimo}
                  helperText={errors.estoqueMinimo?.message}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingProduto ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}