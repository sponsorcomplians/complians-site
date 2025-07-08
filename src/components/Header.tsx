'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, User, LogOut, Users, BarChart3, Building, Shield, Settings, TrendingUp, CreditCard, Activity } from 'lucide-react';
import AlertsBell from './AlertsBell';
import { Badge } from '@/components/ui/badge';
import { AdminOnly, CanViewAnalytics } from '@/components/RoleBasedAccess';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterProducts = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsProductsOpen(true);
  };

  const handleMouseLeaveProducts = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 150);
  };

  const handleMouseEnterUserMenu = () => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
    }
    setIsUserMenuOpen(true);
  };

  const handleMouseLeaveUserMenu = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    };
  }, []);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Auditor': return 'bg-yellow-100 text-yellow-800';
      case 'Viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'Admin': return <Shield className="h-3 w-3" />;
      case 'Manager': return <Users className="h-3 w-3" />;
      case 'Auditor': return <User className="h-3 w-3" />;
      case 'Viewer': return <User className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  // TODO: RE-ENABLE AUTH
  // Temporarily bypass all session and auth checks for development
  const session = {
    user: {
      email: 'dev@example.com',
      name: 'Dev User',
      company: 'Dev Company',
      tenant_id: 'dev-tenant-id',
      role: 'Admin',
      id: 'dev-user-id',
    },
    is_email_verified: true,
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logos/logo.png"
                alt="Complians"
                width={160}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>

            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterProducts}
              onMouseLeave={handleMouseLeaveProducts}
            >
              <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Products
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/products"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Digital Sponsor Compliance Tools</div>
                    <div className="text-sm text-gray-500 mt-1">Traditional compliance checking tools</div>
                  </Link>
                  <Link
                    href="/ai-agents"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">AI Sponsor Compliance Agents</div>
                    <div className="text-sm text-gray-500 mt-1">Advanced AI-powered compliance automation</div>
                  </Link>
                  <a
                    href="https://dragon.sponsorcomplians.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Dragon AI Recruitment Agents</div>
                    <div className="text-sm text-gray-500 mt-1">AI agents for sponsor-based recruitment</div>
                  </a>
                </div>
              )}
            </div>

            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>

            {session && (
              <Link href="/workers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Workers
              </Link>
            )}

            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>

            <Link href="/complians-hr" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Complians HR
            </Link>
          </nav>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <AlertsBell />
                
                {/* Company Name Display */}
                {session.user?.company && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{session.user.company}</span>
                  </div>
                )}
                
                {/* User Role Display */}
                {session.user?.role && (
                  <Badge className={getRoleBadgeColor(session.user.role)}>
                    <span className="flex items-center gap-1">
                      {getRoleIcon(session.user.role)}
                      {session.user.role}
                    </span>
                  </Badge>
                )}
                
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnterUserMenu}
                  onMouseLeave={handleMouseLeaveUserMenu}
                >
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <User className="h-5 w-5" />
                    <span>{session.user?.name || session.user?.email}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link href="/master-compliance-dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Master Dashboard
                      </Link>
                      <Link href="/workers" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Users className="h-4 w-4 mr-2" />
                        Workers
                      </Link>
                      
                      {/* Analytics and Billing links for users with permission */}
                      <CanViewAnalytics>
                        <Link href="/analytics" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </Link>
                        <Link href="/billing" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Billing
                        </Link>
                      </CanViewAnalytics>
                      
                      {/* Admin-only links */}
                      <AdminOnly>
                        <Link href="/audit-logs" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                          <Activity className="h-4 w-4 mr-2" />
                          Audit Logs
                        </Link>
                        <Link href="/admin/users" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                          <Shield className="h-4 w-4 mr-2" />
                          User Management
                        </Link>
                        <Link href="/tenant-ai-settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                          <Settings className="h-4 w-4 mr-2" />
                          AI Settings
                        </Link>
                      </AdminOnly>
                      
                      {/* TEMPORARILY DISABLED FOR DEV */}
                      {/* <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button> */}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* TEMPORARILY DISABLED FOR DEV */}
                {/* <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Sign In
                </Link> */}
                <Link
                  href="/ai-agents"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                Home
              </Link>
              <Link href="/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                Products
              </Link>
              <Link href="/ai-agents" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                AI Agents
              </Link>
              <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                About
              </Link>
              {session && (
                <Link href="/workers" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                  Workers
                </Link>
              )}
              <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                Contact
              </Link>
              
              {session ? (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/master-compliance-dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      Master Dashboard
                    </Link>
                    <Link href="/workers" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      Workers
                    </Link>
                    
                    {/* Analytics and Billing links for mobile */}
                    <CanViewAnalytics>
                      <Link href="/analytics" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        Analytics
                      </Link>
                      <Link href="/billing" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        Billing
                      </Link>
                    </CanViewAnalytics>
                    
                    {/* Admin-only mobile links */}
                    <AdminOnly>
                      <Link href="/audit-logs" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        Audit Logs
                      </Link>
                      <Link href="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        User Management
                      </Link>
                      <Link href="/tenant-ai-settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        AI Settings
                      </Link>
                    </AdminOnly>
                    
                    {/* TEMPORARILY DISABLED FOR DEV */}
                    {/* <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button> */}
                  </div>
                  
                  {/* Mobile user info */}
                  <div className="border-t border-gray-200 pt-2 mt-2 px-4">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{session.user?.name || session.user?.email}</div>
                      {session.user?.company && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          <span>{session.user.company}</span>
                        </div>
                      )}
                      {session.user?.role && (
                        <div className="mt-1">
                          <Badge className={getRoleBadgeColor(session.user.role)}>
                            <span className="flex items-center gap-1">
                              {getRoleIcon(session.user.role)}
                              {session.user.role}
                            </span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {/* TEMPORARILY DISABLED FOR DEV */}
                  {/* <Link href="/auth/signin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                    Sign In
                  </Link> */}
                  <Link href="/ai-agents" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                    Get Started
                  </Link>
                </div>
              )}

              <Link href="/complians-hr" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                Complians HR
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
