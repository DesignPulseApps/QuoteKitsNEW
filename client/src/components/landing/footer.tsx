import { Link } from "wouter";
import logoPath from "@assets/ChatGPT Image Jun 11, 2025, 11_57_41 AM_1749637333080.png";

export default function Footer() {
  return (
    <footer className="bg-midnight-900 border-t border-midnight-700 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logoPath} 
                alt="QuoteKits Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI-powered quote calculators that help service businesses convert more visitors into paying clients.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="m16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link href="/niches" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Niches
                </Link>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Templates
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Affiliate Program
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Status
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-neon-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-neon-400 hover:text-neon-300 transition-colors font-medium">
                  🔒 Admin Demo
                </Link>
                <div className="text-xs text-gray-500 mt-1">
                  Email: admin@quotekit.ai<br/>
                  Password: admin123
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-midnight-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 QuoteKits. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Built with ❤️ for service businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
