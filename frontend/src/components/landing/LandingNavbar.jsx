import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/consync-logo-white.png" 
              alt="ConSync Logo" 
              className="h-10 transition-all duration-500"
              style={{
                filter: isScrolled ? 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%)' : 'brightness(1)'
              }}
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#showcase"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
            >
              Solutions
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
            >
              About
            </a>
            <a
              href="#cta"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
            >
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}