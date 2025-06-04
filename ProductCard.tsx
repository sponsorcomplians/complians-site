import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/database'
import Button from './Button'
import { Play, Download, Star } from 'lucide-react'

interface ProductCardProps {
  product: Product
  showDescription?: boolean
}

export default function ProductCard({ product, showDescription = true }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#263976] to-[#00c3ff]">
            <div className="text-white text-center">
              <Download className="w-12 h-12 mx-auto mb-2" />
              <span className="text-sm font-medium">Digital Product</span>
            </div>
          </div>
        )}
        
        {/* Video indicator */}
        {product.video_url && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 rounded-full p-2">
            <Play className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center ml-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.9</span>
          </div>
        </div>

        {showDescription && product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {product.description}
          </p>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Download className="w-3 h-3 mr-1" />
            Instant Download
          </span>
          {product.video_url && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Play className="w-3 h-3 mr-1" />
              Video Tutorial
            </span>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-[#263976]">
            {formatPrice(product.price)}
          </div>
          <div className="flex space-x-2">
            <Link href={`/products/${product.slug}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            <Link href={`/products/${product.slug}#buy`}>
              <Button size="sm">
                Buy Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

