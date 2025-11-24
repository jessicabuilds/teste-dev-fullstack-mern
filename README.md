# Plataforma E-commerce

Aplicação full-stack de e-commerce desenvolvida com a stack MERN, oferecendo uma arquitetura completa para catálogo, carrinho, pedidos e pagamentos.

## Sobre o Projeto

A plataforma possui as seguintes funcionalidades:

- Autenticação utilizando JWT com refresh tokens  
- Catálogo de produtos e categorias  
- Carrinho de compras  
- Processamento de pedidos  
- Integração com gateway de pagamento (Pagar.me)  
- Jobs em background para sincronização e manutenção  
- Interface responsiva desenvolvida em React  

## Stack Tecnológica

### Backend
- Node.js + Express  
- MongoDB + Mongoose  
- JWT  
- Bcrypt  
- Winston (logs)  
- Node-cron (tarefas agendadas)  
- Jest (testes)  

### Frontend
- React 18  
- React Router  
- Axios  
- React Toastify  

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
