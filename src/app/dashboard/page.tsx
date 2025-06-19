'use client';
export const dynamic = 'force-dynamic';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User, Settings, ShoppingBag, CreditCard, LogOut, Bell, ChevronRight, Package,
  Calendar, Mail, Phone, Building, Briefcase, Users, Building2,
  CheckCircle, Clock, AlertCircle, Download, Eye
} from 'lucide-react';

// Interfaces
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  phone: string;
  job_title: string;
  company_size: string;
  industry: string;
  avatar_url: string;
  created_at: string;
}

interface Purchase {
  id: string;
  product_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface ProductAccess {
  id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  access_granted_at: string;
}

// ✅ Only one export default
export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [productAccess, setProductAccess] = useState<ProductAccess[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchUserData();
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, purchasesRes, accessRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/purchases'),
        fetch('/api/user/product-access'),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
      }

      if (purchasesRes.ok) {
        const purchaseData = await purchasesRes.json();
        setPurchases(purchaseData.purchases || []);
      }

      if (accessRes.ok) {
        const accessData = await accessRes.json();
        setProductAccess(accessData.access || []);
      }

    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: currency || 'GBP'
    }).format(amount / 100);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // 👉🏼 Copy your existing JSX here unchanged...
  // Due to character limits, we’ll not repeat the full render again.

  return (
    <div>
      {/* Your JSX code starts here (header, sidebar, content tabs, etc.) */}
      {/* All your layout is valid as long as there's only one export default */}
    </div>
  );
}
