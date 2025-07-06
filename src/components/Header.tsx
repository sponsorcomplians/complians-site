'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ChevronDown, User, LogOut, Users, BarChart3 } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
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
          </nav>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
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
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
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
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>

              {/* Mobile Products Section */}
              <div className="space-y-2">
                <div className="text-gray-900 font-medium">Products</div>
                <div className="pl-4 space-y-2">
                  <Link href="/products" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Digital Sponsor Compliance Tools
                  </Link>
                  <Link href="/ai-agents" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    AI Sponsor Compliance Agents
                  </Link>
                  <a
                    href="https://dragon.sponsorcomplians.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dragon AI Recruitment Agents
                  </a>
                </div>
              </div>

              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>

              {session && (
                <Link href="/workers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Workers
                </Link>
              )}

              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {session ? (
                  <div className="space-y-2">
                    <div className="text-gray-900 font-medium">
                      {session.user?.name || session.user?.email}
                    </div>
                    <Link href="/dashboard" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/master-compliance-dashboard" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Master Dashboard
                    </Link>
                    <Link href="/workers" className="block text-gray-600 hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Workers Management
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/signin" className="block text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
