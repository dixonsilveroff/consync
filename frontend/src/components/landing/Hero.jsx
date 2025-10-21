import { Link } from 'react-router-dom';
import ChevronDownIcon from '../icons/ChevronDownIcon';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-500 animate-gradient opacity-10" />
      
      {/* Geometric Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Diagonal Lines */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-blue-100/30 to-transparent transform skew-x-12" />
      
      {/* Hero Image Background */}
      <div className="absolute inset-0 opacity-5">
        <img
          src="https://images.unsplash.com/photo-1614507709861-0914c7354893?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxjb25zdHJ1Y3Rpb24lMjBjcmFuZSUyMGJ1aWxkaW5nJTIwYXJjaGl0ZWN0dXJlfGVufDB8MHx8Ymx1ZXwxNzYwMzYzNDE2fDA&ixlib=rb-4.1.0&q=85"
          alt="Miles Chang on Unsplash"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full">
              <span className="text-blue-600 font-semibold text-sm">
                Connecting Every Phase of Construction
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
              <span className="text-gray-900">Reimagining</span>
              <br />
              <span className="text-gradient">Construction</span>
              <br />
              <span className="text-gray-900">Project Management</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              ConSync helps contractors, engineers, and clients manage every phase — 
              from design to delivery — in one transparent platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Try the Demo
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 text-center"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative glass-effect-strong rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-lg opacity-20 blur-xl" />
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600 font-medium">Projects Managed</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                  <div className="text-gray-600 font-medium">Client Satisfaction</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600 font-medium">Real-time Updates</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-blue-600 mb-2">₦800M+</div>
                  <div className="text-gray-600 font-medium">Cost Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#features"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-blue-600 animate-bounce cursor-pointer"
      >
        <ChevronDownIcon width={32} height={32} />
      </a>
    </section>
  );
}