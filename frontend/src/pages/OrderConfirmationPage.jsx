import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

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
          <Link to="/" className="btn-primary">
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
          <p className="text-gray-600">
            Obrigado pela sua compra. Seu pedido foi recebido e está sendo processado.
          </p>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pedido #{order.orderNumber}</h2>
              <p className="text-sm text-gray-600">
                Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.product._id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.name || 'Produto'}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity} x R$ {(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    R$ {((item.quantity || 0) * (item.price || 0)).toFixed(2)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
            <p className="text-sm text-gray-600">
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
              CEP: {order.shippingAddress?.zipCode}<br />
              {order.shippingAddress?.country}
            </p>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Status do Pagamento</h3>
            <p className="text-sm text-gray-600 mb-2">
              Status: <span className="font-medium">{getStatusText(order.paymentStatus)}</span>
            </p>
            {order.transaction && (
              <p className="text-sm text-gray-600">
                ID da Transação: {order.transaction.gatewayTransactionId}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/orders" className="btn-primary flex-1 text-center">
            Ver Meus Pedidos
          </Link>
          <Link to="/products" className="btn-secondary flex-1 text-center">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;