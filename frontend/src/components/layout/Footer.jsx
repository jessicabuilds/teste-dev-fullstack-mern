import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">TechStore</h3>
            <p className="text-sm">
              Sua loja de eletrônicos com os melhores produtos e preços do mercado.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">
                  Carrinho
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  Meus Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li>Central de Ajuda</li>
              <li>Política de Privacidade</li>
              <li>Termos de Uso</li>
              <li>Trocas e Devoluções</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li>📧 contato@techstore.com</li>
              <li>📱 (11) 9999-9999</li>
              <li>📍 São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} TechStore. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
