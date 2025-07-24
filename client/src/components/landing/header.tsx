import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/ChatGPT Image Jun 11, 2025, 11_57_41 AM_1749637333080.png";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-midnight-700/50 ${
        isScrolled ? "bg-midnight-900/95 backdrop-blur-md" : "bg-midnight-900/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={logoPath} 
              alt="QuoteKits Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-gray-300 hover:text-neon-400 transition-colors"
            >
              Home
            </button>
            <Link href="/features">
              <button className="text-gray-300 hover:text-neon-400 transition-colors">
                Features
              </button>
            </Link>
            <Link href="/niches">
              <button className="text-gray-300 hover:text-neon-400 transition-colors">
                Niches
              </button>
            </Link>
            <Link href="/pricing">
              <button className="text-gray-300 hover:text-neon-400 transition-colors">
                Pricing
              </button>
            </Link>
            <Link href="/login">
              <button className="text-gray-300 hover:text-neon-400 transition-colors">
                Login
              </button>
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link href="/register">
              <Button className="bg-neon-500 hover:bg-neon-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-glow">
                Start Free Trial
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-midnight-800 border-t border-midnight-700">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <button
              onClick={() => scrollToSection("home")}
              className="block text-gray-300 hover:text-neon-400 transition-colors"
            >
              Home
            </button>
            <Link href="/features">
              <button className="block text-gray-300 hover:text-neon-400 transition-colors">
                Features
              </button>
            </Link>
            <Link href="/niches">
              <button className="block text-gray-300 hover:text-neon-400 transition-colors">
                Niches
              </button>
            </Link>
            <Link href="/pricing">
              <button className="block text-gray-300 hover:text-neon-400 transition-colors">
                Pricing
              </button>
            </Link>
            <Link href="/login">
              <button className="block text-gray-300 hover:text-neon-400 transition-colors">
                Login
              </button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
