# Plataforma E-commerce

Aplicação e-commerce full-stack construída com stack MERN.

## Sobre

Plataforma de e-commerce com as seguintes funcionalidades:

- Autenticação JWT com refresh tokens
- Catálogo de produtos e categorias
- Carrinho de compras
- Processamento de pedidos
- Integração com gateway de pagamento (Pagar.me)
- Jobs em background para sincronização e manutenção
- Interface React responsiva

## Stack Tecnológica

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Autenticação JWT
- Bcrypt
- Winston
- Node-cron
- Jest + fast-check

**Frontend:**
- React 18
- React Router
- Axios
- React Toastify

## Estrutura do Projeto

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── cronjobs/
│   │   └── webhooks/
│   └── tests/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        ├── hooks/
        ├── context/
        └── styles/
```

## Começando

### Pré-requisitos

- Node.js 16+
- MongoDB
- npm ou yarn

### Instalação

Clone o repositório e instale as dependências:

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd frontend
npm install
cp .env.example .env
```

Edite os arquivos `.env` com sua configuração.

## Executando

**Backend** (executa na porta 5000):
```bash
cd backend
npm run dev
```

**Frontend** (executa na porta 3000):
```bash
cd frontend
npm start
```

## Testes

Execute os testes:
```bash
cd backend
npm test
```

## Variáveis de Ambiente

Verifique os arquivos `.env.example` nas pastas backend e frontend para as variáveis necessárias.

## Licença

MIT
