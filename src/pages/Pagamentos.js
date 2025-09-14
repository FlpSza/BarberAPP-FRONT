// src/pages/Pagamentos.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  AccountBalance,
  People,
  Calculate,
  Payment,
  Add,
  Settings,
  Visibility,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import api from '../services/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: 'white',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Pagamentos() {
  const [tabValue, setTabValue] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [configuracoes, setConfiguracoes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para cálculo
  const [calculoDialog, setCalculoDialog] = useState(false);
  const [calculoForm, setCalculoForm] = useState({
    barbeiroId: '',
    periodoInicio: dayjs().startOf('month'),
    periodoFim: dayjs().endOf('month')
  });
  
  // Estados para configuração
  const [configDialog, setConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState({
    barbeiroId: '',
    tipoComissao: 'porcentagem',
    porcentagemServicos: 50,
    porcentagemProdutos: 30,
    valorAluguelCadeira: 0,
    valorFixoMensal: 0,
    metaMensal: 0,
    bonusMeta: 0
  });
  
  // Estados para descontos
  const [descontoDialog, setDescontoDialog] = useState(false);
  const [descontoForm, setDescontoForm] = useState({
    barbeiroId: '',
    tipo: 'desconto',
    descricao: '',
    valor: '',
    dataAplicacao: dayjs()
  });

  // Estado para pagamento
  const [pagamentoDialog, setPagamentoDialog] = useState(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);

  useEffect(() => {
    loadDashboard();
    loadConfiguracoes();
    loadBarbeiros();
    loadRelatorio('mes');
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/pagamentos/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const loadRelatorio = async (periodo = 'mes', barbeiroId = null) => {
    try {
      setLoading(true);
      const params = { periodo };
      if (barbeiroId) params.barbeiroId = barbeiroId;
      
      const response = await api.get('/pagamentos/relatorio', { params });
      setRelatorio(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguracoes = async () => {
    try {
      const response = await api.get('/pagamentos/configuracoes');
      setConfiguracoes(response.data.configuracoes);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadBarbeiros = async () => {
    try {
      const response = await api.get('/barbeiros');
      setBarbeiros(response.data.barbeiros);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    }
  };

  const handleCalcular = async () => {
    try {
      setLoading(true);
      const payload = {
        barbeiroId: calculoForm.barbeiroId || undefined,
        periodoInicio: calculoForm.periodoInicio.format('YYYY-MM-DD'),
        periodoFim: calculoForm.periodoFim.format('YYYY-MM-DD')
      };

      const response = await api.post('/pagamentos/calcular', payload);
      setCalculoDialog(false);
      loadRelatorio('mes'); // Recarregar relatório
      loadDashboard(); // Recarregar dashboard
    } catch (error) {
      console.error('Erro ao calcular pagamentos:', error);
      alert('Erro ao calcular pagamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarConfiguracao = async () => {
    try {
      await api.post('/pagamentos/configuracoes', configForm);
      setConfigDialog(false);
      loadConfiguracoes();
      // Reset form
      setConfigForm({
        barbeiroId: '',
        tipoComissao: 'porcentagem',
        porcentagemServicos: 50,
        porcentagemProdutos: 30,
        valorAluguelCadeira: 0,
        valorFixoMensal: 0,
        metaMensal: 0,
        bonusMeta: 0
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração. Tente novamente.');
    }
  };

  const handleAdicionarDesconto = async () => {
    try {
      const payload = {
        ...descontoForm,
        dataAplicacao: descontoForm.dataAplicacao.format('YYYY-MM-DD')
      };

      await api.post('/pagamentos/descontos', payload);
      setDescontoDialog(false);
      // Reset form
      setDescontoForm({
        barbeiroId: '',
        tipo: 'desconto',
        descricao: '',
        valor: '',
        dataAplicacao: dayjs()
      });
    } catch (error) {
      console.error('Erro ao adicionar desconto:', error);
      alert('Erro ao adicionar desconto. Tente novamente.');
    }
  };

  const handleMarcarPago = async () => {
    try {
      await api.patch(`/pagamentos/marcar-pago/${pagamentoSelecionado.id}`, {
        dataPagamento: dayjs().format('YYYY-MM-DD')
      });
      
      setPagamentoDialog(false);
      setPagamentoSelecionado(null);
      loadRelatorio('mes');
      loadDashboard();
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      alert('Erro ao marcar pagamento. Tente novamente.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getTipoComissaoLabel = (tipo) => {
    const tipos = {
      'porcentagem': 'Porcentagem',
      'valor_fixo': 'Valor Fixo',
      'aluguel_cadeira': 'Aluguel de Cadeira'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Pagamentos & Comissões
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Calculate />}
            onClick={() => setCalculoDialog(true)}
          >
            Calcular
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setConfigDialog(true)}
          >
            Configurar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDescontoDialog(true)}
          >
            Desconto/Adiantamento
          </Button>
        </Box>
      </Box>

      {/* Dashboard Cards */}
      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Barbeiros"
              value={dashboard.estatisticas.totalBarbeiros}
              icon={<People />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Comissões do Mês"
              value={formatCurrency(dashboard.estatisticas.totalComissoesMes)}
              icon={<AttachMoney />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Valor Pago"
              value={formatCurrency(dashboard.estatisticas.totalPagoMes)}
              icon={<CheckCircle />}
              color="success"
              subtitle={`${dashboard.estatisticas.percentualPago.toFixed(1)}% do total`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pendente"
              value={formatCurrency(dashboard.estatisticas.totalPendenteMes)}
              icon={<AccountBalance />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Relatório de Pagamentos" />
          <Tab label="Configurações" />
          <Tab label="Top Performers" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" gap={2} mb={3}>
            <Button onClick={() => loadRelatorio('dia')} variant={relatorio?.periodo === 'dia' ? 'contained' : 'outlined'}>
              Hoje
            </Button>
            <Button onClick={() => loadRelatorio('semana')} variant={relatorio?.periodo === 'semana' ? 'contained' : 'outlined'}>
              Esta Semana
            </Button>
            <Button onClick={() => loadRelatorio('mes')} variant={relatorio?.periodo === 'mes' ? 'contained' : 'outlined'}>
              Este Mês
            </Button>
          </Box>

          {relatorio && (
            <>
              {/* Resumo */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Período
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Total em Vendas</Typography>
                      <Typography variant="h6">{formatCurrency(relatorio.resumo.totalVendas)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Total Comissões</Typography>
                      <Typography variant="h6">{formatCurrency(relatorio.resumo.totalComissoes)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Total Pago</Typography>
                      <Typography variant="h6" color="success.main">{formatCurrency(relatorio.resumo.totalPago)}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="textSecondary">Pendente</Typography>
                      <Typography variant="h6" color="warning.main">{formatCurrency(relatorio.resumo.totalPendente)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tabela de Pagamentos */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Barbeiro</TableCell>
                      <TableCell>Total Vendas</TableCell>
                      <TableCell>Comissão Serviços</TableCell>
                      <TableCell>Comissão Produtos</TableCell>
                      <TableCell>Bônus/Aluguel</TableCell>
                      <TableCell>Total Líquido</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorio.calculos.map((calculo) => (
                      <TableRow key={calculo.id}>
                        <TableCell>{calculo.barbeiro.nome}</TableCell>
                        <TableCell>{formatCurrency(calculo.totalVendas)}</TableCell>
                        <TableCell>{formatCurrency(calculo.comissaoServicos)}</TableCell>
                        <TableCell>{formatCurrency(calculo.comissaoProdutos)}</TableCell>
                        <TableCell>
                          {calculo.valorAluguel > 0 
                            ? `- ${formatCurrency(calculo.valorAluguel)}` 
                            : formatCurrency(calculo.bonusMeta)
                          }
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(calculo.valorLiquido)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={calculo.pago ? 'Pago' : 'Pendente'}
                            color={calculo.pago ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {!calculo.pago && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setPagamentoSelecionado(calculo);
                                setPagamentoDialog(true);
                              }}
                            >
                              <Payment />
                            </IconButton>
                          )}
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Configurações de Comissão por Barbeiro
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Barbeiro</TableCell>
                  <TableCell>Tipo de Comissão</TableCell>
                  <TableCell>% Serviços</TableCell>
                  <TableCell>% Produtos</TableCell>
                  <TableCell>Valor Aluguel</TableCell>
                  <TableCell>Meta Mensal</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configuracoes.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.barbeiro.nome}</TableCell>
                    <TableCell>{getTipoComissaoLabel(config.tipoComissao)}</TableCell>
                    <TableCell>{config.porcentagemServicos}%</TableCell>
                    <TableCell>{config.porcentagemProdutos}%</TableCell>
                    <TableCell>{formatCurrency(config.valorAluguelCadeira)}</TableCell>
                    <TableCell>{formatCurrency(config.metaMensal)}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {dashboard && dashboard.topPerformers && (
            <>
              <Typography variant="h6" gutterBottom>
                Top Performers do Mês
              </Typography>
              <List>
                {dashboard.topPerformers.map((performer, index) => (
                  <ListItem key={performer.id}>
                    <ListItemText
                      primary={`${index + 1}. ${performer.barbeiro.nome}`}
                      secondary={`Total em vendas: ${formatCurrency(performer.totalVendas)}`}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(performer.valorLiquido)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>
      </Paper>

      {/* Dialog de Cálculo */}
      <Dialog open={calculoDialog} onClose={() => setCalculoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Calcular Pagamentos</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Barbeiro (deixe vazio para todos)</InputLabel>
                <Select
                  value={calculoForm.barbeiroId}
                  onChange={(e) => setCalculoForm({...calculoForm, barbeiroId: e.target.value})}
                >
                  <MenuItem value="">Todos os barbeiros</MenuItem>
                  {barbeiros.map((barbeiro) => (
                    <MenuItem key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Data Início"
                value={calculoForm.periodoInicio}
                onChange={(newValue) => setCalculoForm({...calculoForm, periodoInicio: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Data Fim"
                value={calculoForm.periodoFim}
                onChange={(newValue) => setCalculoForm({...calculoForm, periodoFim: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculoDialog(false)}>Cancelar</Button>
          <Button onClick={handleCalcular} variant="contained" disabled={loading}>
            Calcular
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Configuração */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configurar Comissão</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Barbeiro</InputLabel>
                <Select
                  value={configForm.barbeiroId}
                  onChange={(e) => setConfigForm({...configForm, barbeiroId: e.target.value})}
                  required
                >
                  {barbeiros.map((barbeiro) => (
                    <MenuItem key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Comissão</InputLabel>
                <Select
                  value={configForm.tipoComissao}
                  onChange={(e) => setConfigForm({...configForm, tipoComissao: e.target.value})}
                >
                  <MenuItem value="porcentagem">Porcentagem</MenuItem>
                  <MenuItem value="valor_fixo">Valor Fixo</MenuItem>
                  <MenuItem value="aluguel_cadeira">Aluguel de Cadeira</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Apenas UM bloco para cada tipo de comissão */}
            {configForm.tipoComissao === 'porcentagem' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Porcentagem Serviços (%)"
                    type="number"
                    value={configForm.porcentagemServicos}
                    onChange={(e) => setConfigForm({...configForm, porcentagemServicos: e.target.value})}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Porcentagem Produtos (%)"
                    type="number"
                    value={configForm.porcentagemProdutos}
                    onChange={(e) => setConfigForm({...configForm, porcentagemProdutos: e.target.value})}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              </>
            )}

            {configForm.tipoComissao === 'aluguel_cadeira' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor do Aluguel (R$)"
                    type="number"
                    value={configForm.valorAluguelCadeira}
                    onChange={(e) => setConfigForm({...configForm, valorAluguelCadeira: e.target.value})}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Porcentagem Produtos (%)"
                    type="number"
                    value={configForm.porcentagemProdutos}
                    onChange={(e) => setConfigForm({...configForm, porcentagemProdutos: e.target.value})}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              </>
            )}

            {configForm.tipoComissao === 'valor_fixo' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor Fixo Mensal (R$)"
                    type="number"
                    value={configForm.valorFixoMensal}
                    onChange={(e) => setConfigForm({...configForm, valorFixoMensal: e.target.value})}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Porcentagem Produtos (%)"
                    type="number"
                    value={configForm.porcentagemProdutos}
                    onChange={(e) => setConfigForm({...configForm, porcentagemProdutos: e.target.value})}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Meta Mensal (R$)"
                type="number"
                value={configForm.metaMensal}
                onChange={(e) => setConfigForm({...configForm, metaMensal: e.target.value})}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Meta para receber bônus"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bônus por Meta (%)"
                type="number"
                value={configForm.bonusMeta}
                onChange={(e) => setConfigForm({...configForm, bonusMeta: e.target.value})}
                inputProps={{ min: 0, max: 100 }}
                helperText="% do total vendido quando atingir meta"
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Porcentagem:</strong> Comissão baseada em % das vendas<br />
              <strong>Valor Fixo:</strong> Valor fixo mensal + % produtos<br />
              <strong>Aluguel Cadeira:</strong> Barbeiro paga aluguel fixo e fica com o resto
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancelar</Button>
          <Button onClick={handleSalvarConfiguracao} variant="contained">
            Salvar Configuração
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Desconto/Adiantamento */}
      <Dialog open={descontoDialog} onClose={() => setDescontoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Desconto/Adiantamento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Barbeiro</InputLabel>
                <Select
                  value={descontoForm.barbeiroId}
                  onChange={(e) => setDescontoForm({...descontoForm, barbeiroId: e.target.value})}
                  required
                >
                  {barbeiros.map((barbeiro) => (
                    <MenuItem key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={descontoForm.tipo}
                  onChange={(e) => setDescontoForm({...descontoForm, tipo: e.target.value})}
                >
                  <MenuItem value="desconto">Desconto</MenuItem>
                  <MenuItem value="adiantamento">Adiantamento</MenuItem>
                  <MenuItem value="bonus">Bônus</MenuItem>
                  <MenuItem value="multa">Multa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={descontoForm.descricao}
                onChange={(e) => setDescontoForm({...descontoForm, descricao: e.target.value})}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor (R$)"
                type="number"
                value={descontoForm.valor}
                onChange={(e) => setDescontoForm({...descontoForm, valor: e.target.value})}
                required
                inputProps={{ min: 0.01, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data de Aplicação"
                value={descontoForm.dataAplicacao}
                onChange={(newValue) => setDescontoForm({...descontoForm, dataAplicacao: newValue})}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Desconto:</strong> Reduz o valor a pagar<br />
              <strong>Adiantamento:</strong> Valor já pago antecipadamente<br />
              <strong>Bônus:</strong> Valor adicional a pagar<br />
              <strong>Multa:</strong> Redução por alguma penalidade
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDescontoDialog(false)}>Cancelar</Button>
          <Button onClick={handleAdicionarDesconto} variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Pagamento */}
      <Dialog open={pagamentoDialog} onClose={() => setPagamentoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Pagamento</DialogTitle>
        <DialogContent>
          {pagamentoSelecionado && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {pagamentoSelecionado.barbeiro.nome}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Total em Vendas</Typography>
                  <Typography variant="body1">{formatCurrency(pagamentoSelecionado.totalVendas)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Comissão Serviços</Typography>
                  <Typography variant="body1">{formatCurrency(pagamentoSelecionado.comissaoServicos)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Comissão Produtos</Typography>
                  <Typography variant="body1">{formatCurrency(pagamentoSelecionado.comissaoProdutos)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Bônus/Aluguel</Typography>
                  <Typography variant="body1">
                    {pagamentoSelecionado.valorAluguel > 0 
                      ? `- ${formatCurrency(pagamentoSelecionado.valorAluguel)}` 
                      : formatCurrency(pagamentoSelecionado.bonusMeta)
                    }
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Total Líquido:</Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(pagamentoSelecionado.valorLiquido)}
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta ação irá marcar o pagamento como realizado e não poderá ser desfeita.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagamentoDialog(false)}>Cancelar</Button>
          <Button onClick={handleMarcarPago} variant="contained" color="primary">
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}