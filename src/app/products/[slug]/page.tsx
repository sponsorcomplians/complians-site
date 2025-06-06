import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/products'
import { getCurrentUser, userHasPurchasedProduct } from '@/lib/auth'
import Button from '@/components/Button'
import CheckoutButton from '@/components/CheckoutButton'
import { Play, Download, Shield, Clock, Users, Star } from 'lucide-react'
import Link from 'next/link'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  const user = await getCurrentUser()
  const hasPurchased = user ? await userHasPurchasedProduct(user.id, product.id) : false

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Hero */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image/Video */}
            <div className="space-y-4">
              <div className="relative h-96 bg-gradient-to-br from-[#263976] to-[#00c3ff] rounded-lg overflow-hidden">
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Download className="w-20 h-20 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold">Digital Product</h3>
                      <p className="text-gray-200">Ready for instant download</p>
                    </div>
                  </div>
                )}
                
                {product.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-black bg-opacity-70 hover:bg-opacity-80 rounded-full p-4 transition-all">
                      <Play className="w-8 h-8 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <Download className="w-6 h-6 mx-auto mb-2 text-[#263976]" />
                  <span className="text-sm font-medium">Instant Download</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-[#263976]" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-[#263976]" />
                  <span className="text-sm font-medium">Lifetime Access</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-[#263976]" />
                  <span className="text-sm font-medium">Expert Support</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.title}
                </h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">(4.9/5 from 127 reviews)</span>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price and Purchase */}
              <div className="bg-gray-50 rounded-lg p-6" id="buy">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-[#263976]">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-gray-500 ml-2">One-time payment</span>
                  </div>
                </div>

                {hasPurchased ? (
                  <div className="space-y-3">
                    <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        ✓ You own this product
                      </p>
                      <p className="text-green-600 text-sm">
                        Access your downloads in the dashboard
                      </p>
                    </div>
                    <Link href="/dashboard">
                      <Button className="w-full" size="lg">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <CheckoutButton 
                      productId={product.id}
                      className="w-full"
                    >
                      Buy Now
                    </CheckoutButton>
                    <p className="text-xs text-gray-500 text-center">
                      Secure payment powered by Stripe. 30-day money-back guarantee.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/api/auth/signin">
                      <Button className="w-full" size="lg">
                        Sign In to Purchase
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-500 text-center">
                      Secure payment powered by Stripe. 30-day money-back guarantee.
                    </p>
                  </div>
                )}
              </div>

              {/* What's Included */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold mb-4">What's Included:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00c3ff] rounded-full mr-3"></span>
                    Comprehensive compliance template (DOCX format)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00c3ff] rounded-full mr-3"></span>
                    Step-by-step implementation guide (PDF)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00c3ff] rounded-full mr-3"></span>
                    Video tutorial and walkthrough
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00c3ff] rounded-full mr-3"></span>
                    Email support for 30 days
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-[#00c3ff] rounded-full mr-3"></span>
                    Free updates for 1 year
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          
          <div className="prose max-w-none">
            <h3>About This Product</h3>
            <p>
              The Qualification Compliance Checker is an essential tool for UK sponsors who need to verify 
              that their sponsored workers meet Home Office qualification requirements. This comprehensive 
              template has been developed by immigration experts with years of experience in sponsor compliance.
            </p>

            <h3>Key Features</h3>
            <ul>
              <li>Pre-built qualification assessment framework</li>
              <li>Home Office compliant documentation templates</li>
              <li>Risk assessment and mitigation strategies</li>
              <li>Audit trail and record-keeping guidance</li>
              <li>Regular updates to reflect policy changes</li>
            </ul>

            <h3>Who Is This For?</h3>
            <p>
              This product is designed for UK sponsor licence holders, HR professionals, immigration 
              advisers, and compliance officers who need to ensure their sponsored workers meet the 
              necessary qualification requirements.
            </p>

            <h3>Support</h3>
            <p>
              Purchase includes 30 days of email support to help you implement the templates and 
              guidance effectively. Our team of immigration experts is here to help you succeed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

