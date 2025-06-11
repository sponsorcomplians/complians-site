import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#263976] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logos/logo.png"
                  alt="Complians"
                  width={140}
                  height={35}
                  className="h-7 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Professional compliance tools and AI-powered solutions for sponsor compliance and immigration professionals. 
              Simplifying complex compliance requirements with expert-designed templates and intelligent automation.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span>support@complians.co.uk</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-2" />
                <span>+44 (0) 20 1234 5678</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Digital Tools
                </Link>
              </li>
              <li>
                <Link href="/ai-agents" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  AI Agents
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-[#00c3ff] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} Complians. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-[#00c3ff] text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-[#00c3ff] text-sm transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-gray-300 hover:text-[#00c3ff] text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
