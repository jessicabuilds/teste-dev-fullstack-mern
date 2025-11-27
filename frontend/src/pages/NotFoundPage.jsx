import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Ilustração 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <div className="mt-4">
            <svg
              className="mx-auto h-32 w-32 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Mensagem */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Página não encontrada
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Ops! A página que você está procurando não existe.
          </p>
          <p className="text-gray-500">
            Ela pode ter sido movida ou removida.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Voltar para Home
          </Link>
          
          <Link
            to="/products"
            className="btn-secondary inline-flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Ver Produtos
          </Link>
        </div>

        {/* Links úteis */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            Ou explore estas páginas:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/carrinho"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Carrinho
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/pedidos"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Meus Pedidos
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/perfil"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
