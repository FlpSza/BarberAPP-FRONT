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
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add,
  PointOfSale,
  AttachMoney,
  Receipt,
  Delete,
  ShoppingCart,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import api from '../services/api';

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_debito', label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'pix', label: 'PIX' }
];

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  // Estados para nova venda
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carrinhoItens, setCarrinhoItens] = useState([]);
  const [vendaForm, setVendaForm] = useState({
    clienteId: '',
    barbeiroId: '',
    formaPagamento: '',
    observacoes: ''
  });

  useEffect(() => {
    loadVendas();
    loadSelectOptions();
  }, [selectedDate]);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendas', {
        params: { data: selectedDate.format('YYYY-MM-DD') }
      });
      setVendas(response.data.vendas || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      // Mock data para demonstração
      setVendas([
        {
          id: 1,
          total: 50.00,
          formaPagamento: 'dinheiro',
          dataVenda: selectedDate.format('YYYY-MM-DD'),
          cliente: { nome: 'João Silva' },
          barbeiro: { nome: 'Carlos' },
          itens: [
            { produto: { nome: 'Corte + Barba' }, quantidade: 1, preco_unitario: 35.00 },
            { produto: { nome: 'Pomada' }, quantidade: 1, preco_unitario: 15.00 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectOptions = async () => {
    try {
      const [clientesRes, barbeirosRes, servicosRes, produtosRes] = await Promise.all([
        api.get('/clientes?limit=100'),
        api.get('/barbeiros'),
        api.get('/servicos'),
        api.get('/produtos')
      ]);
      
      setClientes(clientesRes.data.clientes || []);
      setBarbeiros(barbeirosRes.data.barbeiros || []);
      setServicos(servicosRes.data.servicos || []);
      setProdutos(produtosRes.data.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  const handleOpenDialog = () => {
    setCarrinhoItens([]);
    setVendaForm({
      clienteId: '',
      barbeiroId: '',
      formaPagamento: '',
      observacoes: ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const adicionarItem = (tipo, item) => {
    const novoItem = {
      tipo,
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      quantidade: 1
    };
    
    const itemExistente = carrinhoItens.findIndex(i => 
      i.tipo === tipo && i.id === item.id
    );
    
    if (itemExistente >= 0) {
      const novosItens = [...carrinhoItens];
      novosItens[itemExistente].quantidade += 1;
      setCarrinhoItens(novosItens);
    } else {
      setCarrinhoItens([...carrinhoItens, novoItem]);
    }
  };

  const removerItem = (index) => {
    setCarrinhoItens(carrinhoItens.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return carrinhoItens.reduce((total, item) => 
      total + (item.preco * item.quantidade), 0
    );
  };

  const finalizarVenda = async () => {
    try {
      const payload = {
        ...vendaForm,
        total: calcularTotal(),
        itens: carrinhoItens.map(item => ({
          tipo: item.tipo,
          id: item.id,
          quantidade: item.quantidade,
          preco_unitario: item.preco
        }))
      };

      await api.post('/vendas', payload);
      handleCloseDialog();
      loadVendas();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao finalizar venda. Tente novamente.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getFormaPagamentoLabel = (forma) => {
    const formaPagamento = formasPagamento.find(f => f.value === forma);
    return formaPagamento ? formaPagamento.label : forma;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Vendas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Nova Venda
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
                onClick={() => setSelectedDate(dayjs())}
              >
                Hoje
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resumo do Dia */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">Total de Vendas</Typography>
                  <Typography variant="h4">
                    {formatCurrency(vendas.reduce((sum, venda) => sum + venda.total, 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PointOfSale sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h6">Número de Vendas</Typography>
                  <Typography variant="h4">{vendas.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">Ticket Médio</Typography>
                  <Typography variant="h4">
                    {vendas.length > 0 
                      ? formatCurrency(vendas.reduce((sum, v) => sum + v.total, 0) / vendas.length)
                      : formatCurrency(0)
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Horário</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Barbeiro</TableCell>
              <TableCell>Itens</TableCell>
              <TableCell>Forma Pagamento</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendas.map((venda) => (
              <TableRow key={venda.id}>
                <TableCell>
                  {new Date(venda.dataVenda).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>{venda.cliente?.nome || '-'}</TableCell>
                <TableCell>{venda.barbeiro?.nome || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {venda.itens?.length || 0} item(s)
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getFormaPagamentoLabel(venda.formaPagamento)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(venda.total)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Nova Venda */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <ShoppingCart sx={{ mr: 1 }} />
            Nova Venda
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Informações da Venda */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom>
                  Informações da Venda
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Cliente"
                      value={vendaForm.clienteId}
                      onChange={(e) => setVendaForm({...vendaForm, clienteId: e.target.value})}
                    >
                      <MenuItem value="">Selecione um cliente</MenuItem>
                      {clientes.map((cliente) => (
                        <MenuItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Barbeiro"
                      value={vendaForm.barbeiroId}
                      onChange={(e) => setVendaForm({...vendaForm, barbeiroId: e.target.value})}
                    >
                      <MenuItem value="">Selecione um barbeiro</MenuItem>
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
                      label="Forma de Pagamento"
                      value={vendaForm.formaPagamento}
                      onChange={(e) => setVendaForm({...vendaForm, formaPagamento: e.target.value})}
                    >
                      {formasPagamento.map((forma) => (
                        <MenuItem key={forma.value} value={forma.value}>
                          {forma.label}
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
                      value={vendaForm.observacoes}
                      onChange={(e) => setVendaForm({...vendaForm, observacoes: e.target.value})}
                    />
                  </Grid>
                </Grid>

                {/* Resumo do Carrinho */}
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Resumo
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Itens:</Typography>
                    <Typography>{carrinhoItens.length}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(calcularTotal())}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Produtos e Serviços */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Serviços
                </Typography>
                
                <List dense>
                  {servicos.map((servico) => (
                    <ListItem 
                      key={servico.id} 
                      button 
                      onClick={() => adicionarItem('servico', servico)}
                    >
                      <ListItemText
                        primary={servico.nome}
                        secondary={`${formatCurrency(servico.preco)} - ${servico.duracaoMinutos}min`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => adicionarItem('servico', servico)}
                        >
                          <Add />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Produtos
                </Typography>
                
                <List dense>
                  {produtos.map((produto) => (
                    <ListItem 
                      key={produto.id} 
                      button 
                      onClick={() => adicionarItem('produto', produto)}
                      disabled={produto.estoque === 0}
                    >
                      <ListItemText
                        primary={produto.nome}
                        secondary={`${formatCurrency(produto.preco)} - Estoque: ${produto.estoque}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => adicionarItem('produto', produto)}
                          disabled={produto.estoque === 0}
                        >
                          <Add />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Carrinho */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Carrinho de Compras
                </Typography>
                
                {carrinhoItens.length === 0 ? (
                  <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                    Nenhum item adicionado
                  </Typography>
                ) : (
                  <List dense>
                    {carrinhoItens.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={item.nome}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {formatCurrency(item.preco)} x {item.quantidade}
                              </Typography>
                              <Typography variant="body2" color="primary">
                                Subtotal: {formatCurrency(item.preco * item.quantidade)}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            color="error"
                            onClick={() => removerItem(index)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={finalizarVenda}
            disabled={carrinhoItens.length === 0 || !vendaForm.formaPagamento}
          >
            Finalizar Venda - {formatCurrency(calcularTotal())}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}