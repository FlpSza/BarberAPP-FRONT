import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Phone,
  Email,
  Person,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import api from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadClientes();
  }, [page, rowsPerPage, search]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search
        }
      });
      
      setClientes(response.data.clientes || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      // Mock data para demonstração
      setClientes([
        {
          id: 1,
          nome: 'João Silva',
          telefone: '(11) 99999-9999',
          email: 'joao@email.com',
          dataNascimento: '1990-05-15',
          ativo: true
        },
        {
          id: 2,
          nome: 'Pedro Santos',
          telefone: '(11) 88888-8888',
          email: 'pedro@email.com',
          dataNascimento: '1985-08-22',
          ativo: true
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (cliente = null) => {
    setEditingCliente(cliente);
    if (cliente) {
      reset(cliente);
    } else {
      reset({
        nome: '',
        telefone: '',
        email: '',
        dataNascimento: '',
        observacoes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCliente(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}`, data);
      } else {
        await api.post('/clientes', data);
      }
      
      handleCloseDialog();
      loadClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        loadClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente. Tente novamente.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Cliente
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar clientes..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Data Nascimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width={120}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{formatPhone(cliente.telefone)}</TableCell>
                <TableCell>{cliente.email || '-'}</TableCell>
                <TableCell>{formatDate(cliente.dataNascimento)}</TableCell>
                <TableCell>
                  <Chip
                    label={cliente.ativo ? 'Ativo' : 'Inativo'}
                    color={cliente.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(cliente)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count}`
          }
        />
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
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
                        <Person />
                      </InputAdornment>
                    ),
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
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data de Nascimento"
                  type="date"
                  {...register('dataNascimento')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
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
              {editingCliente ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}