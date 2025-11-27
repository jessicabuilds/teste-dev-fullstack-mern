import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loading from '../components/common/Loading';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Brasil',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });

      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Brasil',
    });
    setEditing(false);
  };

  if (!user) {
    return <Loading fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary"
            >
              Editar Perfil
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Pessoais</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="(00) 00000-0000"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone || 'Não informado'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Endereço</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Rua, número, complemento"
                  />
                ) : (
                  <p className="text-gray-900">{user.address?.street || 'Não informado'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.city || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-field"
                      maxLength="2"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.state || 'Não informado'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.zipCode || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address?.country || 'Brasil'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
