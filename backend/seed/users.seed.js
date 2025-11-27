const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '(11) 98765-4321',
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
  },
  {
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'Joao123!',
    phone: '(11) 91234-5678',
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil',
    },
  },
  {
    name: 'Maria Santos',
    email: 'maria@example.com',
    password: 'Maria123!',
    phone: '(21) 98765-1234',
    address: {
      street: 'Rua Copacabana, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22070-001',
      country: 'Brasil',
    },
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    password: 'Pedro123!',
    phone: '(31) 99876-5432',
    address: {
      street: 'Rua da Bahia, 789',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30160-011',
      country: 'Brasil',
    },
  },
  {
    name: 'Ana Costa',
    email: 'ana@example.com',
    password: 'Ana123!',
    phone: '(41) 97654-3210',
    address: {
      street: 'Rua XV de Novembro, 321',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '80020-310',
      country: 'Brasil',
    },
  },
];

const seedUsers = async (User) => {
  try {
    console.log('Processando seed de usuários...');
    
    await User.deleteMany({});
    console.log('Usuários antigos removidos');

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    await User.insertMany(usersWithHashedPasswords);

    console.log(`${users.length} usuários inseridos com sucesso!\n`);
    console.log('Credenciais de teste:');
    users.forEach((user) => {
      console.log(`Email: ${user.email} | Senha: ${user.password}`);
    });
    console.log('');
  } catch (error) {
    console.error('Erro ao criar seed de usuários:', error);
    throw error;
  }
};

module.exports = seedUsers;
