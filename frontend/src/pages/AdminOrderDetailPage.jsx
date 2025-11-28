import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Acesso negado');
      navigate('/');
      return;
    }
    loadOrder();
  }, [orderId, user, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={loadOrder} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h2>
          <Link to="/admin/orders" className="btn-primary">
            Voltar ao Gerenciamento
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      processing: 'Processando',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      failed: 'Falhou',
    };
    return texts[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao Gerenciamento
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Pedido</h1>
          <p className="text-gray-600 mt-2">
            Cliente: {order.userId?.name || 'N/A'} ({order.userId?.email || 'N/A'})
          </p>
        </div>

        {/* Informações do Pedido */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pedido #{order.orderNumber}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                Pagamento: {getStatusText(order.paymentStatus)}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity} x R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    R$ {(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span className="text-primary-600">R$ {(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
            {order.shippingAddress ? (
              <p className="text-sm text-gray-600">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                CEP: {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Endereço não disponível</p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Informações de Pagamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{getStatusText(order.paymentStatus)}</span>
              </div>
              {order.transaction?.gatewayTransactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Transação:</span>
                  <span className="font-medium text-xs">{order.transaction.gatewayTransactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
