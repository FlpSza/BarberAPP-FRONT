# Sistema BarberShop - Guia de Instalação Completo

Sistema completo de gestão para barbearias desenvolvido com **React** (frontend) e **Node.js + Express** (backend), utilizando **MySQL** como banco de dados.

## 📋 Pré-requisitos

- **Node.js** (v16 ou superior)
- **MySQL** (v8.0 ou superior)
- **npm** ou **yarn**
- **Git** (opcional)

## 🚀 Instalação

### 1. Preparação do Ambiente

#### No Ubuntu/Debian:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar MySQL
sudo apt install mysql-server -y

# Configurar MySQL
sudo mysql_secure_installation
```

#### No CentOS/RHEL/Fedora:
```bash
# Node.js
sudo dnf install nodejs npm -y

# MySQL (ou MariaDB)
sudo dnf install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation
```

### 2. Configuração do Banco de Dados

```bash
# Acessar MySQL como root
sudo mysql -u root -p

# No terminal MySQL, execute:
```

```sql
-- Criar banco de dados
CREATE DATABASE barbershop;

-- Criar usuário específico (recomendado)
CREATE USER 'barbershop_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON barbershop.* TO 'barbershop_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar o banco criado
USE barbershop;

-- Execute o script SQL completo fornecido anteriormente
-- (cole todo o conteúdo do arquivo de criação das tabelas)
```

### 3. Estrutura de Pastas

Crie a estrutura do projeto:

```bash
# Criar pasta principal
mkdir BarberShop
cd BarberShop

# Criar estrutura
mkdir backend frontend database docs
```

### 4. Configuração do Backend (Node.js)

```bash
# Navegar para pasta do backend
cd backend

# Criar package.json
npm init -y

# Instalar dependências principais
npm install express cors dotenv bcryptjs jsonwebtoken mysql2 sequelize

# Instalar dependências de validação e utilidades
npm install joi express-validator helmet morgan

# Dependências de desenvolvimento
npm install nodemon --save-dev
```

#### Criar estrutura de pastas do backend:
```bash
mkdir -p src/{config,models,routes,middleware,controllers}
```

#### Configurar package.json:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### Criar arquivo .env:
```bash
# Criar arquivo de configuração
touch .env
```

Conteúdo do `.env`:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Configurações do banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=barbershop
DB_USER=barbershop_user
DB_PASSWORD=senha_segura_aqui

# JWT
JWT_SECRET=sua_chave_secreta_jwt_muito_segura_aqui_com_pelo_menos_32_caracteres
JWT_EXPIRES_IN=8h
```

### 5. Configuração do Frontend (React)

```bash
# Voltar para pasta principal e ir para frontend
cd ../frontend

# Criar aplicação React
npx create-react-app . --template typescript

# OU se preferir JavaScript puro:
# npx create-react-app .

# Instalar dependências do Material-UI
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @mui/x-date-pickers

# Instalar outras dependências
npm install axios react-router-dom
npm install react-hook-form @hookform/resolvers yup
npm install dayjs
```

### 6. Estrutura de Pastas do Frontend

```bash
# Criar estrutura de pastas
mkdir -p src/{components,pages,context,services,utils}
mkdir -p src/components/{Layout,Common}
```

## 🏃‍♂️ Executando o Sistema

### 1. Iniciar Backend

```bash
# Na pasta backend
cd backend
npm run dev

# O servidor iniciará na porta 5000
# Você verá: "🚀 Servidor rodando na porta 5000"
```

### 2. Iniciar Frontend

```bash
# Em outro terminal, na pasta frontend
cd frontend
npm start

# A aplicação React abrirá automaticamente no navegador
# URL: http://localhost:3000
```

## 🔐 Acesso ao Sistema

**Usuário padrão criado:**
- **Email:** admin@barbershop.com
- **Senha:** admin123 (altere após primeiro acesso)

## 📁 Estrutura Final do Projeto

```
BarberShop/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── Cliente.js
│   │   │   ├── Barbeiro.js
│   │   │   ├── Servico.js
│   │   │   └── ... (outros modelos)
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── clientes.js
│   │   │   └── ... (outras rotas)
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── controllers/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Layout.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Clientes.js
│   │   │   └── ... (outras páginas)
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   ├── package.json
│   └── public/
├── database/
│   └── create_database.sql
└── docs/
    └── README.md
```

## 🛠️ Comandos Úteis

### Backend:
```bash
# Instalar dependências
npm install

# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start

# Verificar logs
npm run dev | grep -i error
```

### Frontend:
```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm start

# Build para produção
npm run build

# Testar build de produção
npm run build && npx serve -s build
```

### Banco de Dados:
```bash
# Backup do banco
mysqldump -u barbershop_user -p barbershop > backup_barbershop.sql

# Restaurar backup
mysql -u barbershop_user -p barbershop < backup_barbershop.sql

# Conectar ao banco
mysql -u barbershop_user -p barbershop
```

## 🐛 Resolução de Problemas

### Erro de Conexão com MySQL:
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Iniciar MySQL se não estiver rodando
sudo systemctl start mysql

# Verificar usuário e senha
mysql -u barbershop_user -p
```

### Erro de Porta em Uso:
```bash
# Verificar qual processo está usando a porta
sudo lsof -i :5000
sudo lsof -i :3000

# Matar processo se necessário
sudo kill -9 PID
```

### Erro de Dependências:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Ou usar yarn
yarn install
```

### Erro de CORS:
Verifique se no backend o CORS está configurado para permitir `http://localhost:3000`

## 📊 Funcionalidades do Sistema

### ✅ Implementadas:
- **Autenticação** - Login/Logout com JWT
- **Dashboard** - Visão geral com estatísticas
- **Clientes** - CRUD completo
- **Barbeiros** - Gestão de profissionais
- **Serviços** - Catálogo de serviços
- **Agendamentos** - Sistema de agendamento
- **Produtos** - Controle de estoque
- **Vendas** - PDV (Ponto de Venda)

### 🔄 Próximas Melhorias:
- Relatórios avançados
- Notificações por WhatsApp
- App mobile
- Sistema de fidelidade
- Integração com calendário

## 📞 Suporte

Se encontrar algum problema durante a instalação:

1. **Verifique os logs** nos terminais do backend e frontend
2. **Confirme as configurações** do arquivo .env
3. **Teste a conexão** com o banco de dados
4. **Verifique as portas** 3000 e 5000 estão livres

## 🎯 Próximos Passos

Após instalação bem-sucedida:

1. **Altere a senha padrão** do usuário admin
2. **Configure o backup automático** do banco
3. **Personalize o tema** da aplicação
4. **Configure SSL** para produção
5. **Implemente monitoramento** de logs

---

**Sistema desenvolvido com ❤️ para facilitar a gestão de barbearias**





# 💰 Sistema de Pagamentos & Comissões - Guia Completo

## 🎯 Visão Geral

O sistema de pagamentos permite gerenciar diferentes tipos de comissão para cada barbeiro da sua barbearia:

- **Porcentagem**: Comissão baseada em % das vendas
- **Valor Fixo**: Salário fixo mensal + comissão de produtos
- **Aluguel de Cadeira**: Barbeiro paga aluguel fixo e fica com o restante

## 📋 Funcionalidades Principais
git push -u origin main
### ✅ Dashboard de Pagamentos
- Visão geral com estatísticas do mês
- Total de barbeiros ativos
- Comissões calculadas vs pagas
- Top performers do período

### ✅ Configuração de Comissões
- Configure % diferente para cada barbeiro
- Defina metas mensais e bônus
- Histórico de alterações

### ✅ Cálculo Automático
- Calcula pagamentos por período (dia/semana/mês)
- Considera vendas de serviços e produtos separadamente
- Aplica descontos e adiantamentos automaticamente

### ✅ Controle de Pagamentos
- Marque pagamentos como realizados
- Histórico de pagamentos
- Relatórios detalhados

## 🚀 Como Usar

### 1. **Configurar Comissões**

1. Acesse **Pagamentos** → Aba **Configurações**
2. Clique em **Configurar** 
3. Escolha o barbeiro e tipo de comissão:

#### **Tipo Porcentagem:**
- **% Serviços**: Ex: 50% (barbeiro fica com 50% do valor dos serviços)
- **% Produtos**: Ex: 30% (barbeiro fica com 30% do valor dos produtos)
- **Meta Mensal**: Ex: R$ 2.000 (meta para ganhar bônus)
- **% Bônus**: Ex: 5% (5% extra sobre vendas se atingir meta)

#### **Tipo Aluguel de Cadeira:**
- **Valor Aluguel**: Ex: R$ 800/mês (valor fixo que barbeiro paga)
- **% Produtos**: Ex: 30% (comissão sobre produtos vendidos)
- Barbeiro fica com 100% dos serviços menos o aluguel

#### **Tipo Valor Fixo:**
- **Valor Fixo**: Ex: R$ 1.500/mês (salário fixo)
- **% Produtos**: Ex: 30% (comissão sobre produtos)

### 2. **Calcular Pagamentos**

1. Clique em **Calcular**
2. Escolha o período (ou deixe o mês atual)
3. Selecione barbeiro específico ou "Todos"
4. Clique **Calcular**

O sistema automaticamente:
- ✅ Soma todas as vendas do período
- ✅ Separa serviços de produtos  
- ✅ Aplica as % configuradas
- ✅ Verifica se atingiu metas para bônus
- ✅ Desconta aluguel (se aplicável)
- ✅ Aplica descontos/adiantamentos

### 3. **Gerenciar Descontos e Adiantamentos**

1. Clique em **Desconto/Adiantamento**
2. Escolha o tipo:
   - **Desconto**: Reduz valor a pagar (ex: falta, atraso)
   - **Adiantamento**: Valor já pago antecipadamente
   - **Bônus**: Valor extra (ex: bom comportamento)
   - **Multa**: Penalidade

3. Preencha descrição, valor e data
4. Será aplicado automaticamente no próximo cálculo

### 4. **Efetuar Pagamentos**

1. Na aba **Relatório de Pagamentos**
2. Clique no ícone 💳 ao lado do barbeiro
3. Confira os valores detalhados
4. Clique **Confirmar Pagamento**
5. O status mudará para "Pago" ✅

## 📊 Exemplos Práticos

### **Exemplo 1: Barbeiro João - Porcentagem**
**Configuração:**
- 50% dos serviços
- 30% dos produtos  
- Meta: R$ 3.000
- Bônus: 5%

**Vendas do Mês:**
- Serviços: R$ 2.500
- Produtos: R$ 800
- Total: R$ 3.300

**Cálculo:**
- Comissão serviços: R$ 2.500 × 50% = R$ 1.250
- Comissão produtos: R$ 800 × 30% = R$ 240
- Bônus (atingiu meta): R$ 3.300 × 5% = R$ 165
- **Total a pagar: R$ 1.655**

### **Exemplo 2: Barbeiro Carlos - Aluguel**
**Configuração:**
- Aluguel: R$ 600/mês
- 20% dos produtos

**Vendas do Mês:**
- Serviços: R$ 2.200
- Produtos: R$ 500

**Cálculo:**
- Serviços menos aluguel: R$ 2.200 - R$ 600 = R$ 1.600
- Comissão produtos: R$ 500 × 20% = R$ 100
- **Total a pagar: R$ 1.700**

### **Exemplo 3: Barbeiro Pedro - Valor Fixo**
**Configuração:**
- Fixo: R$ 1.200/mês
- 25% dos produtos

**Vendas do Mês:**
- Produtos: R$ 600

**Cálculo:**
- Valor fixo: R$ 1.200
- Comissão produtos: R$ 600 × 25% = R$ 150
- **Total a pagar: R$ 1.350**

## 📈 Relatórios Disponíveis

### **Dashboard Principal**
- Resumo financeiro do mês
- Top 5 barbeiros do período
- Pagamentos pendentes
- % de pagamentos realizados

### **Relatório por Período**
- Filtro por dia/semana/mês
- Detalhamento por barbeiro
- Totais de vendas e comissões
- Status de pagamentos

### **Configurações**
- Histórico de alterações de comissão
- Configurações ativas por barbeiro

## 🔧 Dicas Importantes

### **✅ Boas Práticas:**
- Configure as comissões no início de cada mês
- Calcule os pagamentos semanalmente
- Efetue pagamentos sempre na mesma data
- Documente descontos com descrições claras

### **⚠️ Cuidados:**
- Pagamentos marcados como "Pago" não podem ser alterados
- Descontos só podem ser excluídos se não foram aplicados
- Sempre confira os cálculos antes de marcar como pago

### **🚀 Automações:**
- Sistema calcula automaticamente com base nas vendas registradas
- Aplica configurações vigentes na data das vendas
- Metas e bônus são verificados automaticamente

## 💡 Cenários de Uso

### **Barbearia Tradicional**
- Barbeiros com porcentagem fixa (40-60%)
- Produtos com % menor (20-30%)
- Metas mensais para incentivo

### **Barbearia Premium**
- Aluguel de cadeira para barbeiros experientes
- Valores mais altos, mais independência
- Foco na qualidade vs quantidade

### **Barbearia Mista**
- Funcionários novos: valor fixo + comissão
- Experientes: porcentagem ou aluguel
- Flexibilidade por período/performance

---

**🎯 Objetivo:** Ter controle total sobre pagamentos, motivar a equipe e manter a lucratividade da barbearia!