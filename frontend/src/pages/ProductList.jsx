const ProductList = () => {
  // TODO: Conectar com API
  const products = []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Produtos</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="card">
            <h3 className="font-bold mb-4">Categorias</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Smartphones</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Notebooks</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Tablets</span>
              </label>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-4">Faixa de Preço</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Até R$ 500</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>R$ 500 - R$ 1000</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Acima de R$ 1000</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Lista de Produtos */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Produtos serão renderizados aqui */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList
