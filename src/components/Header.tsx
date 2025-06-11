'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, User, LogOut, ShoppingBag, ChevronDown } from 'lucide-react'

export default function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Improved dropdown behavior with better timing
  const handleMouseEnterDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsProductsDropdownOpen(true)
  }

  const handleMouseLeaveDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProductsDropdownOpen(false)
    }, 150) // 150ms delay makes it much more user-friendly
  }

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {/* Placeholder for logo image */}
              <div className="w-10 h-10 bg-[#263976] rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-[#263976]">Complians</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-[#263976] px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            {/* Products Dropdown - Improved UX */}
            <div 
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnterDropdown}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <button
                onClick={toggleProductsDropdown}
                className="flex items-center text-gray-700 hover:text-[#263976] px-3 py-2 text-sm font-medium transition-colors"
              >
                Products
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Simplified Dropdown Menu */}
              {isProductsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <Link
                      href="/products"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#263976] transition-colors border-b border-gray-100"
                    >
                      <div className="font-medium">Digital Sponsor Compliance Tools</div>
                      <div className="text-xs text-gray-500 mt-1">Traditional compliance checking tools</div>
                    </Link>
                    <Link
                      href="/ai-agents"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#263976] transition-colors"
                    >
                      <div className="font-medium">AI Sponsor Compliance Agents</div>
                      <div className="text-xs text-gray-500 mt-1">Advanced AI-powered compliance automation</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link
              href="/about"
              className="text-gray-700 hover:text-[#263976] px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-[#263976] px-3 py-2 text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#263976] border-t-transparent"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center text-gray-700 hover:text-[#263976] px-3 py-2 text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/api/auth/signin"
                  className="text-gray-700 hover:text-[#263976] px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#263976] hover:bg-[#1e2a5a] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-[#263976] p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/"
                className="block text-gray-700 hover:text-[#263976] px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Mobile Products Section - Simplified */}
              <div>
                <button
                  onClick={toggleProductsDropdown}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-[#263976] px-3 py-2 text-base font-medium"
                >
                  Products
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProductsDropdownOpen && (
                  <div className="pl-6 space-y-2">
                    <Link
                      href="/products"
                      className="block text-gray-600 hover:text-[#263976] px-3 py-2 text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="font-medium">Digital Sponsor Compliance Tools</div>
                      <div className="text-sm text-gray-500">Traditional compliance checking</div>
                    </Link>
                    <Link
                      href="/ai-agents"
                      className="block text-gray-600 hover:text-[#263976] px-3 py-2 text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="font-medium">AI Sponsor Compliance Agents</div>
                      <div className="text-sm text-gray-500">AI-powered automation</div>
                    </Link>
                  </div>
                )}
              </div>
              
              <Link
                href="/about"
                className="block text-gray-700 hover:text-[#263976] px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-gray-700 hover:text-[#263976] px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {session ? (
                <div className="border-t border-gray-200 pt-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center text-gray-700 hover:text-[#263976] px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    href="/api/auth/signin"
                    className="block text-gray-700 hover:text-[#263976] px-3 py-2 text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block bg-[#263976] hover:bg-[#1e2a5a] text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

