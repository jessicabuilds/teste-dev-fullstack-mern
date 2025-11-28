# 📡 Documentação da API

Documentação completa dos endpoints da API REST da plataforma e-commerce.

**Base URL**: `http://localhost:3001/api`

## 📋 Índice

- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Produtos](#produtos)
- [Carrinho](#carrinho)
- [Pedidos](#pedidos)
- [Códigos de Status](#códigos-de-status)
- [Tratamento de Erros](#tratamento-de-erros)

---

## 🔐 Autenticação

### Registro de Usuário

Cria uma nova conta de usuário.

**Endpoint**: `POST /auth/register`

**Headers**: Nenhum

**Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "Senha123!"
}
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "user"
    }
  }
}
```

**Erros Possíveis**:
- `400` - Dados inválidos ou email já cadastrado
- `500` - Erro interno do servidor

---

### Login

Autentica um usuário e retorna tokens de acesso.

**Endpoint**: `POST /auth/login`

**Headers**: Nenhum

**Body**:
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "user"
    }
  }
}
```

**Erros Possíveis**:
- `401` - Credenciais inválidas
- `400` - Dados inválidos
- `500` - Erro interno do servidor

---

### Refresh Token

Gera um novo access token usando o refresh token.

**Endpoint**: `POST /auth/refresh`

**Headers**: Nenhum

**Body**:
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erros Possíveis**:
- `401` - Refresh token inválido ou expirado
- `400` - Refresh token não fornecido
- `500` - Erro interno do servidor

---

### Logout

Invalida o refresh token do usuário.

**Endpoint**: `POST /auth/logout`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Body**:
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Erros Possíveis**:
- `401` - Token inválido ou não fornecido
- `500` - Erro interno do servidor

---

## 👤 Usuários

### Obter Perfil

Retorna os dados do usuário autenticado.

**Endpoint**: `GET /users/profile`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "user",
    "address": {
      "street": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "country": "Brasil"
    },
    "phone": "(11) 98765-4321",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `404` - Usuário não encontrado
- `500` - Erro interno do servidor

---

### Atualizar Perfil

Atualiza os dados do usuário autenticado.

**Endpoint**: `PUT /users/profile`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Body**:
```json
{
  "name": "João Silva Santos",
  "address": {
    "street": "Rua Nova, 456",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "country": "Brasil"
  },
  "phone": "(11) 98765-4321"
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva Santos",
    "email": "joao@example.com",
    "address": { ... },
    "phone": "(11) 98765-4321"
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `400` - Dados inválidos
- `404` - Usuário não encontrado
- `500` - Erro interno do servidor

---

## 📦 Produtos

### Listar Produtos

Retorna lista de produtos com filtros opcionais.

**Endpoint**: `GET /products`

**Headers**: Nenhum (público)

**Query Parameters**:
- `category` (opcional): Filtrar por categoria (notebooks, smartphones, perifericos, hardware)
- `includeInactive` (opcional): Incluir produtos inativos (apenas para admins)

**Exemplos**:
- `/products` - Todos os produtos ativos
- `/products?category=notebooks` - Apenas notebooks
- `/products?includeInactive=true` - Todos os produtos (admin)

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Notebook Dell Inspiron",
      "description": "Notebook com processador Intel i5",
      "price": 3500.00,
      "category": "notebooks",
      "stock": 15,
      "imageUrl": "https://example.com/image.jpg",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Erros Possíveis**:
- `500` - Erro interno do servidor

---

### Obter Produto por ID

Retorna detalhes de um produto específico.

**Endpoint**: `GET /products/:id`

**Headers**: Nenhum (público)

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Notebook Dell Inspiron",
    "description": "Notebook com processador Intel i5, 8GB RAM, 256GB SSD",
    "price": 3500.00,
    "category": "notebooks",
    "stock": 15,
    "imageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Erros Possíveis**:
- `404` - Produto não encontrado
- `500` - Erro interno do servidor

---

### Criar Produto (Admin)

Cria um novo produto.

**Endpoint**: `POST /products`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Permissão**: Apenas usuários com `role: admin`

**Body**:
```json
{
  "name": "MacBook Air M2",
  "description": "Notebook Apple com chip M2",
  "price": 8999.00,
  "category": "notebooks",
  "stock": 10,
  "imageUrl": "https://example.com/macbook.jpg"
}
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "MacBook Air M2",
    "description": "Notebook Apple com chip M2",
    "price": 8999.00,
    "category": "notebooks",
    "stock": 10,
    "imageUrl": "https://example.com/macbook.jpg",
    "isActive": true,
    "createdAt": "2025-01-15T00:00:00.000Z"
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Sem permissão (não é admin)
- `400` - Dados inválidos
- `500` - Erro interno do servidor

---

### Atualizar Produto (Admin)

Atualiza um produto existente.

**Endpoint**: `PUT /products/:id`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Permissão**: Apenas usuários com `role: admin`

**Body**:
```json
{
  "name": "MacBook Air M2 - Atualizado",
  "price": 8499.00,
  "stock": 15
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "MacBook Air M2 - Atualizado",
    "price": 8499.00,
    "stock": 15,
    ...
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Produto não encontrado
- `400` - Dados inválidos
- `500` - Erro interno do servidor

---

### Ativar/Desativar Produto (Admin)

Alterna o status ativo/inativo de um produto.

**Endpoint**: `PATCH /products/:id/toggle-active`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Permissão**: Apenas usuários com `role: admin`

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "isActive": false,
    ...
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Produto não encontrado
- `500` - Erro interno do servidor

---

### Excluir Produto (Admin)

Exclui permanentemente um produto.

**Endpoint**: `DELETE /products/:id`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Permissão**: Apenas usuários com `role: admin`

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Produto não encontrado
- `500` - Erro interno do servidor

---

## 🛒 Carrinho

### Obter Carrinho

Retorna o carrinho do usuário autenticado.

**Endpoint**: `GET /cart`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "MacBook Air M2",
          "price": 8999.00,
          "imageUrl": "...",
          "stock": 10
        },
        "quantity": 2,
        "price": 8999.00
      }
    ],
    "total": 17998.00,
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `500` - Erro interno do servidor

---

### Adicionar Item ao Carrinho

Adiciona um produto ao carrinho ou incrementa a quantidade se já existir.

**Endpoint**: `POST /cart/items`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Body**:
```json
{
  "productId": "507f1f77bcf86cd799439012",
  "quantity": 2
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "items": [...],
    "total": 17998.00
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `404` - Produto não encontrado
- `400` - Estoque insuficiente ou dados inválidos
- `500` - Erro interno do servidor

---

### Atualizar Quantidade de Item

Atualiza a quantidade de um item no carrinho.

**Endpoint**: `PUT /cart/items/:productId`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Body**:
```json
{
  "quantity": 3
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "items": [...],
    "total": 26997.00
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `404` - Item não encontrado no carrinho
- `400` - Estoque insuficiente ou quantidade inválida
- `500` - Erro interno do servidor

---

### Remover Item do Carrinho

Remove um item do carrinho.

**Endpoint**: `DELETE /cart/items/:productId`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "items": [],
    "total": 0
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `404` - Item não encontrado no carrinho
- `500` - Erro interno do servidor

---

## 📋 Pedidos

### Criar Pedido (Checkout)

Cria um novo pedido a partir do carrinho do usuário.

**Endpoint**: `POST /orders/checkout`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Body**:
```json
{
  "shippingAddress": {
    "street": "Rua Exemplo, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567",
    "country": "Brasil"
  },
  "paymentMethod": {
    "type": "credit_card",
    "cardNumber": "4111111111111111",
    "cardName": "JOAO SILVA",
    "cardExpiry": "12/25",
    "cardCvv": "123"
  }
}
```

**Resposta de Sucesso** (201):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "orderNumber": "ORD-1705320000000-123",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "name": "MacBook Air M2",
        "quantity": 2,
        "price": 8999.00
      }
    ],
    "total": 17998.00,
    "status": "pending",
    "paymentStatus": "pending",
    "shippingAddress": { ... },
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `400` - Carrinho vazio, estoque insuficiente ou dados inválidos
- `500` - Erro interno do servidor

---

### Listar Pedidos do Usuário

Retorna todos os pedidos do usuário autenticado.

**Endpoint**: `GET /orders`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "orderNumber": "ORD-1705320000000-123",
      "items": [...],
      "total": 17998.00,
      "status": "confirmed",
      "paymentStatus": "paid",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `500` - Erro interno do servidor

---

### Obter Detalhes do Pedido

Retorna detalhes de um pedido específico.

**Endpoint**: `GET /orders/:id`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "orderNumber": "ORD-1705320000000-123",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "items": [
      {
        "product": "507f1f77bcf86cd799439012",
        "name": "MacBook Air M2",
        "quantity": 2,
        "price": 8999.00
      }
    ],
    "total": 17998.00,
    "status": "confirmed",
    "paymentStatus": "paid",
    "shippingAddress": {
      "street": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "country": "Brasil"
    },
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:35:00.000Z"
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Acesso negado (pedido de outro usuário)
- `404` - Pedido não encontrado
- `500` - Erro interno do servidor

**Nota**: Admins podem visualizar pedidos de qualquer usuário.

---

### Listar Todos os Pedidos (Admin)

Retorna todos os pedidos da plataforma.

**Endpoint**: `GET /orders/admin/all`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Permissão**: Apenas usuários com `role: admin`

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "orderNumber": "ORD-1705320000000-123",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "João Silva",
        "email": "joao@example.com"
      },
      "items": [...],
      "total": 17998.00,
      "status": "confirmed",
      "paymentStatus": "paid",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Sem permissão (não é admin)
- `500` - Erro interno do servidor

---

### Cancelar Pedido

Cancela um pedido pendente.

**Endpoint**: `POST /orders/:id/cancel`

**Headers**: 
```
Authorization: Bearer {accessToken}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "cancelled",
    ...
  }
}
```

**Erros Possíveis**:
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Pedido não encontrado
- `400` - Pedido não pode ser cancelado (já foi enviado/entregue)
- `500` - Erro interno do servidor

**Nota**: Admins podem cancelar pedidos de qualquer usuário.

---

## 📊 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos ou requisição malformada |
| 401 | Unauthorized - Autenticação necessária ou token inválido |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email já cadastrado) |
| 500 | Internal Server Error - Erro no servidor |

---

## ⚠️ Tratamento de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva",
  "details": {
    "field": "Detalhes específicos do erro (quando aplicável)"
  }
}
```

### Exemplos de Erros

**Validação**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

**Autenticação**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Autorização**:
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**Recurso não encontrado**:
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

## 🔒 Autenticação JWT

A maioria dos endpoints requer autenticação via JWT (JSON Web Token).

### Como usar:

1. Faça login ou registre-se para obter um `accessToken`
2. Inclua o token no header de todas as requisições protegidas:

```
Authorization: Bearer {accessToken}
```

### Tokens:

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 dias

Quando o access token expirar, use o endpoint `/auth/refresh` para obter um novo.

---

## 📝 Notas Importantes

1. **Paginação**: Atualmente não implementada, mas pode ser adicionada aos endpoints de listagem
2. **Rate Limiting**: Implementado para prevenir abuso da API
3. **CORS**: Configurado para aceitar requisições do frontend
4. **Validação**: Todos os dados de entrada são validados antes do processamento
5. **Logs**: Todas as requisições e erros são registrados com Winston
6. **Cronjobs**: 
   - Sincronização de pagamentos a cada 5 minutos
   - Limpeza de carrinhos abandonados diariamente às 2h

---

Desenvolvido com ❤️ por Jéssica Alves
