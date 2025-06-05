import { getProducts } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import { Search, Filter } from 'lucide-react'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#263976] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Digital Compliance Products
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional tools and templates designed by immigration experts to help UK sponsors 
              maintain compliance and streamline their processes.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#263976] focus:border-[#263976]"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              We're working on adding more compliance products. Check back soon!
            </p>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Products?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#263976] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">✓</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Designed</h3>
              <p className="text-gray-600 text-sm">
                Created by immigration professionals with years of compliance experience
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00c3ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-600 text-sm">
                Download immediately after purchase with lifetime access
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#263976] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">📚</span>
              </div>
              <h3 className="font-semibold mb-2">Complete Resources</h3>
              <p className="text-gray-600 text-sm">
                Includes templates, guides, and video tutorials for comprehensive support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

