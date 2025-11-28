import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders');
      setOrders(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      processing: 'Processando',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      failed: 'Falhou',
    };
    return texts[status] || status;
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={loadOrders} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h2>
          <p className="text-gray-600 mb-6">Você ainda não fez nenhuma compra</p>
          <Link to="/products" className="btn-primary inline-block">
            Começar a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} getStatusColor={getStatusColor} getStatusText={getStatusText} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, getStatusColor, getStatusText }) => {
  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Pedido #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} mt-2 sm:mt-0 inline-block`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="space-y-2">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.product?._id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.product?.name || 'Produto'} x {item.quantity}
              </span>
              <span className="font-medium text-gray-900">
                R$ {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
              </span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-gray-500">
              + {order.items.length - 2} {order.items.length - 2 === 1 ? 'item' : 'itens'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600">Total do Pedido</p>
          <p className="text-xl font-bold text-primary-600">
            R$ {(order.total || 0).toFixed(2)}
          </p>
        </div>
        <Link
          to={`/order-confirmation/${order._id}`}
          className="btn-primary text-center"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
