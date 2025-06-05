import { getCurrentUser, getUserPurchasedProducts } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Download, Play, Calendar, FileText } from 'lucide-react'
import Button from '@/components/Button'
import VideoTutorialButton from '@/components/VideoTutorialButton'
import Link from 'next/link'

export default async function Dashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const purchasedProducts = await getUserPurchasedProducts(user.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Access your purchased compliance products and resources.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#263976] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products Owned</p>
                <p className="text-2xl font-bold text-gray-900">{purchasedProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#00c3ff] rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Products */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Products</h2>
          </div>

          {purchasedProducts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {purchasedProducts.map((product) => (
                <div key={product.product_id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {product.product_title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {product.product_description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        Purchased on {formatDate(product.purchase_date)}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {product.product_file_path && (
                          <Link href={`/api/download?productId=${product.product_id}`}>
                            <Button size="sm" variant="primary">
                              <Download className="w-4 h-4 mr-2" />
                              Download Files
                            </Button>
                          </Link>
                        )}
                        
                        {product.product_video_url && (
                          <VideoTutorialButton
                            videoUrl={product.product_video_url}
                            title={`${product.product_title} - Tutorial`}
                          />
                        )}
                        
                        <Link href={`/products/${product.product_id}`}>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#263976] to-[#00c3ff] rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any compliance products yet. Browse our catalog to get started.
              </p>
              <Link href="/products">
                <Button>
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/products">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Browse More Products
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Get Support
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

