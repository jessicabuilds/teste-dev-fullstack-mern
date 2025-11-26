import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAuthenticated = false // TODO: Conectar com contexto de autenticação
  const cartItemsCount = 0 // TODO: Conectar com contexto do carrinho

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">⚡</span>
            <span className="text-xl font-bold text-gray-900">TechStore</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/produtos" className="text-gray-700 hover:text-primary-600 transition">
              Produtos
            </Link>
            <Link to="/carrinho" className="relative text-gray-700 hover:text-primary-600 transition">
              🛒 Carrinho
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/pedidos" className="text-gray-700 hover:text-primary-600 transition">
                  Pedidos
                </Link>
                <Link to="/perfil" className="text-gray-700 hover:text-primary-600 transition">
                  Perfil
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition">
                  Entrar
                </Link>
                <Link to="/registro" className="btn-primary">
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/produtos" className="block py-2 text-gray-700 hover:text-primary-600">
              Produtos
            </Link>
            <Link to="/carrinho" className="block py-2 text-gray-700 hover:text-primary-600">
              🛒 Carrinho {cartItemsCount > 0 && `(${cartItemsCount})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/pedidos" className="block py-2 text-gray-700 hover:text-primary-600">
                  Pedidos
                </Link>
                <Link to="/perfil" className="block py-2 text-gray-700 hover:text-primary-600">
                  Perfil
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-primary-600">
                  Entrar
                </Link>
                <Link to="/registro" className="block py-2 text-gray-700 hover:text-primary-600">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
