import { Link } from 'react-router-dom';
import GithubIcon from '../icons/GithubIcon';
import TwitterIcon from '../icons/TwitterIcon';
import LinkedinIcon from '../icons/LinkedinIcon';
import logoWhite from '../../assets/images/logo-white.png';

export default function Footer() {
  return (
    <footer className="relative bg-steel-dark text-white py-16">
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-growth to-primary" />

      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#F5F6F7 1px, transparent 1px), linear-gradient(90deg, #F5F6F7 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center group">
              <img 
                src={logoWhite} 
                alt="ConSync Logo" 
                className="h-12 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-white/60 leading-relaxed max-w-md">
              Transparent. Intelligent. Progressive construction lifecycle management. 
              Connecting every phase from blueprints to delivery with systematic precision.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <GithubIcon width={20} height={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <TwitterIcon width={20} height={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <LinkedinIcon width={20} height={20} />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Features
                </a>
              </li>
              <li>
                <a href="#showcase" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Solutions
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#testimonials" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#cta" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/60 hover:text-growth transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-growth group-hover:w-4 transition-all duration-300"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} ConSync. All rights reserved.
            </p>
            <p className="text-white/60 text-sm">
              Built with ❤️ for the construction industry
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}