import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section id="cta" className="relative py-32 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-500 animate-gradient" />
      
      {/* Geometric Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 border-4 border-white rounded-lg transform rotate-45" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-white rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Content */}
        <div className="space-y-8">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
            Ready to Build
            <br />
            Smarter?
          </h2>
          
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join the future of construction project management. Start your free trial today and experience the ConSync difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link
              to="/register"
              className="group relative px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Launch App</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
            </Link>
            
            <Link
              to="/login"
              className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
          
          <p className="text-white/70 text-sm pt-4">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}