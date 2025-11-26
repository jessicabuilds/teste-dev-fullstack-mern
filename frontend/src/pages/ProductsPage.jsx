import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const { addItem } = useCart();

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'notebooks', label: 'Notebooks' },
    { value: 'perifericos', label: 'Periféricos' },
    { value: 'hardware', label: 'Hardware' },
  ];

  useEffect(() => {
    // Atualizar categoria quando a URL mudar
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.get('/products', { params });
      
      setProducts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addItem(productId, 1);
    
    if (result.success) {
      toast.success('Produto adicionado ao carrinho!');
    } else {
      toast.error(result.error || 'Erro ao adicionar produto');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos</h1>
        <p className="text-gray-600">Encontre os melhores eletrônicos com os melhores preços</p>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => {
                setSelectedCategory(category.value);
                if (category.value === 'all') {
                  setSearchParams({});
                } else {
                  setSearchParams({ category: category.value });
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorMessage message={error} onRetry={loadProducts} />
      )}

      {/* Lista de Produtos */}
      {!error && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Tente selecionar outra categoria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await onAddToCart(product._id);
    setAddingToCart(false);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="card overflow-hidden">
      {/* Imagem do Produto */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Preço */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary-600">
            R$ {product.price.toFixed(2)}
          </span>
        </div>

        {/* Estoque */}
        <div className="mb-4">
          {isOutOfStock ? (
            <span className="text-sm text-red-600 font-medium">Fora de estoque</span>
          ) : product.stock < 10 ? (
            <span className="text-sm text-orange-600 font-medium">
              Apenas {product.stock} em estoque
            </span>
          ) : (
            <span className="text-sm text-green-600 font-medium">Em estoque</span>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 text-center btn-secondary text-sm"
          >
            Ver Detalhes
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              'Adicionar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
