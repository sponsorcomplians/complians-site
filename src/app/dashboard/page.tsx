'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  Settings, 
  ShoppingBag, 
  CreditCard, 
  LogOut, 
  Bell,
  ChevronRight,
  Package,
  Calendar,
  Mail,
  Phone,
  Building,
  Briefcase,
  Users,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  company_name: string
  phone: string
  job_title: string
  company_size: string
  industry: string
  avatar_url: string
  created_at: string
}

interface Purchase {
  id: string
  product_id: string
  amount: number
  currency: string
  status: string
  created_at: string
}

interface ProductAccess {
  id: string
  product_id: string
  product_name: string
  product_type: string
  access_granted_at: string
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [productAccess, setProductAccess] = useState<ProductAccess[]>([])
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchUserData()
  }, [session, status, router])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
      }

      // Fetch purchases
      const purchasesResponse = await fetch('/api/user/purchases')
      if (purchasesResponse.ok) {
        const purchasesData = await purchasesResponse.json()
        setPurchases(purchasesData.purchases || [])
      }

      // Fetch product access
      const accessResponse = await fetch('/api/user/product-access')
      if (accessResponse.ok) {
        const accessData = await accessResponse.json()
        setProductAccess(accessData.access || [])
      }

    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP'
    }).format(amount / 100)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#263976] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-[#263976]">
                Complians
              </Link>
              <span className="ml-4 text-sm text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#263976] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'overview'
                        ? 'bg-[#263976] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package className="h-5 w-5 mr-3" />
                    Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-[#263976] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'products'
                        ? 'bg-[#263976] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    My Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'purchases'
                        ? 'bg-[#263976] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    Purchase History
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {session.user?.name || 'User'}!
                  </h1>
                  <p className="text-gray-600">
                    Here's an overview of your account and recent activity.
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Products Owned</p>
                        <p className="text-2xl font-bold text-gray-900">{productAccess.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                        <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Member Since</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="p-6">
                    {purchases.length > 0 ? (
                      <div className="space-y-4">
                        {purchases.slice(0, 3).map((purchase) => (
                          <div key={purchase.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getStatusIcon(purchase.status)}
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  Purchase #{purchase.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(purchase.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(purchase.amount, purchase.currency)}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">{purchase.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                </div>
                <div className="p-6">
                  {profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email</p>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Full Name</p>
                            <p className="text-sm text-gray-600">{profile.full_name || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Phone</p>
                            <p className="text-sm text-gray-600">{profile.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Company</p>
                            <p className="text-sm text-gray-600">{profile.company_name || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Job Title</p>
                            <p className="text-sm text-gray-600">{profile.job_title || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Company Size</p>
                            <p className="text-sm text-gray-600">{profile.company_size || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Industry</p>
                            <p className="text-sm text-gray-600">{profile.industry || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Loading profile information...</p>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">My Products</h2>
                </div>
                <div className="p-6">
                  {productAccess.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {productAccess.map((access) => (
                        <div key={access.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {access.product_name}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {access.product_type.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-500">
                                Access granted: {formatDate(access.access_granted_at)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Eye className="h-5 w-5" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Download className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No products owned yet</p>
                      <Link
                        href="/ai-agents"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557]"
                      >
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Purchase History</h2>
                </div>
                <div className="p-6">
                  {purchases.length > 0 ? (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getStatusIcon(purchase.status)}
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  Purchase #{purchase.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(purchase.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(purchase.amount, purchase.currency)}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">{purchase.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No purchases yet</p>
                      <Link
                        href="/ai-agents"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557]"
                      >
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
