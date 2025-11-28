import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { getProductImage } from '../utils/imageHelper';
import Loading from '../components/common/Loading';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, updateItem, removeItem } = useCart();

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeItem(productId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const cartItems = cart?.items || [];
  const cartTotal = cart?.total || 0;
  const isEmpty = cartItems.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho de Compras</h1>

      {isEmpty ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para começar suas compras</p>
          <Link to="/products" className="btn-primary inline-block">
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Resumo do Carrinho */}
          <div className="lg:col-span-1">
            <CartSummary total={cartTotal} onCheckout={handleCheckout} />
          </div>
        </div>
      )}
    </div>
  );
};

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item;

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      onUpdateQuantity(product._id, quantity + 1);
    } else {
      toast.warning('Quantidade máxima em estoque atingida');
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      onUpdateQuantity(product._id, quantity - 1);
    }
  };

  const itemTotal = product.price * quantity;

  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-4">
      {/* Imagem do Produto */}
      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Informações do Produto */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link to={`/products/${product._id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
              {product.name}
            </Link>
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
          </div>
          <button
            onClick={() => onRemove(product._id)}
            className="text-red-600 hover:text-red-800 ml-4"
            title="Remover item"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
          {/* Controles de Quantidade */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Quantidade:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {product.stock < 10 && (
              <span className="text-xs text-orange-600">
                (Apenas {product.stock} disponíveis)
              </span>
            )}
          </div>

          {/* Preço */}
          <div className="text-right">
            <div className="text-sm text-gray-600">
              R$ {product.price.toFixed(2)} cada
            </div>
            <div className="text-xl font-bold text-primary-600">
              R$ {itemTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ total, onCheckout }) => {
  return (
    <div className="card p-4 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Frete</span>
          <span className="text-green-600">Grátis</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span className="text-primary-600">R$ {total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="btn-primary w-full mb-4"
      >
        Finalizar Compra
      </button>

      <Link
        to="/products"
        className="btn-secondary w-full text-center block"
      >
        Continuar Comprando
      </Link>

      {/* Informações de Segurança */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Compra 100% segura
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
          Frete grátis para todo Brasil
        </div>
      </div>
    </div>
  );
};

export default CartPage;
