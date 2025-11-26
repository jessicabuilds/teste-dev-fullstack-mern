require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const products = require('./seed/products.seed');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:senha123@localhost:27017/ecommerce?authSource=admin';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado ao MongoDB');

    await Product.deleteMany({});
    console.log('Produtos antigos removidos');

    await Product.insertMany(products);
    console.log(`${products.length} produtos inseridos com sucesso!`);

    await mongoose.connection.close();
    console.log('Seed concluído!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedDatabase();