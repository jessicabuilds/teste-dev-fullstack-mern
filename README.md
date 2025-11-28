# 🛒 Plataforma E-commerce MERN

Uma plataforma completa de e-commerce desenvolvida com MERN Stack (MongoDB, Express, React, Node.js), incluindo sistema de autenticação, gerenciamento de produtos, carrinho de compras, processamento de pedidos e painel administrativo.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Execução](#execução)
- [Painel Administrativo](#painel-administrativo)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)

## 🎯 Sobre o Projeto

Esta é uma plataforma de e-commerce full-stack que permite aos usuários navegar por produtos, adicionar itens ao carrinho, realizar compras e acompanhar seus pedidos. O sistema inclui autenticação JWT, integração com gateway de pagamento simulado, e sincronização automática de status de pagamentos via cronjobs.

## ✨ Funcionalidades

### Para Usuários
- ✅ **Autenticação e Autorização**
  - Registro de usuário com validação
  - Login com JWT (Access Token + Refresh Token)
  - Logout com invalidação de tokens
  - Refresh automático de tokens

- ✅ **Catálogo de Produtos**
  - Listagem de produtos com filtros por categoria
  - Visualização detalhada de produtos
  - Indicador de disponibilidade em estoque
  - Imagens por categoria

- ✅ **Carrinho de Compras**
  - Adicionar/remover produtos
  - Atualizar quantidades
  - Cálculo automático de totais
  - Reserva temporária de estoque
  - Limpeza automática de carrinhos abandonados (24h)

- ✅ **Processo de Checkout**
  - Formulário de endereço de entrega
  - Validação de dados de cartão de crédito
  - Simulação de pagamento
  - Confirmação de pedido

- ✅ **Gestão de Pedidos**
  - Histórico de pedidos
  - Detalhes de cada pedido
  - Acompanhamento de status
  - Status de pagamento em tempo real

- ✅ **Perfil do Usuário**
  - Visualização e edição de dados
  - Gerenciamento de endereços
  - Persistência de informações

### 🔧 Painel Administrativo (Feature Extra)

**Esta é uma funcionalidade adicional não prevista nos requisitos originais do projeto!**

O sistema inclui um painel administrativo completo para gerenciamento da plataforma:

#### Gerenciamento de Produtos
- Visualizar todos os produtos (ativos e inativos)
- Criar novos produtos
- Editar produtos existentes
- Ativar/desativar produtos
- Excluir produtos permanentemente
- Interface responsiva com tabelas e cards

#### Gerenciamento de Pedidos
- Visualizar todos os pedidos da plataforma
- Filtrar pedidos por status
- Estatísticas em tempo real:
  - Total de pedidos
  - Receita total
  - Pedidos pagos
  - Pedidos pendentes
- Visualizar detalhes completos de qualquer pedido
- Ver informações dos clientes

**Como acessar o painel admin:**
1. Faça login com um usuário que tenha `role: 'admin'`
2. Acesse o menu "Admin" na barra de navegação
3. Navegue entre "Produtos" e "Pedidos"

**Como criar um usuário admin:**
```javascript
// No MongoDB ou através do seed
db.users.updateOne(
  { email: "seu-email@exemplo.com" },
  { $set: { role: "admin" } }
)
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação com tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **Winston** - Sistema de logs
- **node-cron** - Agendamento de tarefas
- **Helmet** - Segurança HTTP
- **CORS** - Controle de acesso

### Frontend
- **React** - Biblioteca UI
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS v4** - Estilização
- **React Toastify** - Notificações
- **Vite** - Build tool
- **Vitest** - Framework de testes

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nodemon** - Hot reload em desenvolvimento

## 📦 Pré-requisitos

- Node.js (v18 ou superior)
- MongoDB (v6 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd ecommerce-mern-platform
```

2. **Instale as dependências do backend**
```bash
cd backend
npm install
```

3. **Instale as dependências do frontend**
```bash
cd ../frontend
npm install
```

4. **Configure as variáveis de ambiente**

Crie um arquivo `.env` no diretório `backend` baseado no `.env.example`:

```env
# Backend
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Payment Gateway (Simulado)
PAGARME_API_KEY=test_key_123
PAGARME_WEBHOOK_SECRET=webhook_secret_123
```

Crie um arquivo `.env` no diretório `frontend` (se necessário):

```env
VITE_API_URL=http://localhost:3001/api
```

## ▶️ Execução

### Usando Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up
```

Isso iniciará:
- MongoDB na porta 27017
- Backend na porta 3001
- Frontend na porta 5173

### Execução Manual

1. **Inicie o MongoDB**
```bash
mongod
```

2. **Inicie o backend**
```bash
cd backend
npm run dev
```

3. **Inicie o frontend**
```bash
cd frontend
npm run dev
```

4. **Popule o banco de dados (opcional)**
```bash
cd backend
npm run seed
```

### Acessar a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 👤 Usuários de Teste

Após executar o seed, você terá:

**Usuário Admin:**
- Email: admin@example.com
- Senha: Admin123!
- Role: admin

**Usuário Comum:**
- Email: maria@example.com
- Senha: Maria123!
- Role: user

## 📁 Estrutura do Projeto

```
ecommerce-mern-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, JWT, Logger)
│   │   ├── controllers/     # Controllers da API
│   │   ├── cronjobs/        # Jobs agendados
│   │   ├── middlewares/     # Middlewares (auth, validation, errors)
│   │   ├── models/          # Models do Mongoose
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Utilitários
│   │   ├── webhooks/        # Handlers de webhooks
│   │   ├── app.js           # Configuração do Express
│   │   └── server.js        # Entry point
│   ├── seed/                # Scripts de seed
│   ├── tests/               # Testes
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── common/      # Componentes reutilizáveis
│   │   │   └── layout/      # Layout (Navbar, Footer)
│   │   ├── contexts/        # Context API (Auth, Cart)
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços (API)
│   │   ├── utils/           # Utilitários
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Entry point
│   ├── public/              # Assets estáticos
│   └── package.json
│
├── docker-compose.yml       # Configuração Docker
└── README.md
```

## 📜 Scripts Disponíveis

### Backend

```bash
npm run dev          # Inicia servidor em modo desenvolvimento
npm start            # Inicia servidor em modo produção
npm run seed         # Popula banco de dados com dados de teste
npm test             # Executa testes
```

### Frontend

```bash
npm run dev          # Inicia aplicação em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm test             # Executa testes
```

## 🔄 Cronjobs

O sistema executa automaticamente:

- **PaymentSyncJob**: Sincroniza status de pagamentos a cada 5 minutos
- **CartCleanupJob**: Limpa carrinhos abandonados diariamente às 2h da manhã

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT com refresh tokens
- Proteção contra CSRF
- Rate limiting
- Helmet para headers de segurança
- Validação de entrada em todos os endpoints
- CORS configurado

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais.

---

Desenvolvido com ❤️ por Jéssica Alves
