import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section id="cta" className="relative py-32 overflow-hidden bg-steel-dark">
      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#F5F6F7 1px, transparent 1px), linear-gradient(90deg, #F5F6F7 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Geometric Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 border-4 border-primary rounded-lg transform rotate-12" />
        <div className="absolute bottom-10 right-10 w-96 h-96 border-4 border-growth rounded-lg transform -rotate-12" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
          <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
            <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </svg>
        </div>
      </div>

      {/* Gradient Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-bl from-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-tr from-growth/20 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Content */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <div className="w-2 h-2 bg-growth rounded-full animate-pulse" />
            <span className="text-white/90 font-semibold text-sm uppercase tracking-wider">
              Start Building Smarter Today
            </span>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-primary-lighter via-growth to-signal bg-clip-text text-transparent">
              Your Projects?
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Join 500+ construction firms using ConSync to deliver projects faster, 
            more transparently, and with complete confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link
              to="/register"
              className="group relative px-10 py-5 bg-white text-steel-dark font-bold text-lg rounded-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-growth opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-growth" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-growth" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-growth" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">50+</div>
              <div className="text-white/60 text-sm">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">99%</div>
              <div className="text-white/60 text-sm">On-time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">24/7</div>
              <div className="text-white/60 text-sm">Real-time Sync</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-white mb-2">₦3.5B</div>
              <div className="text-white/60 text-sm">Managed Budget</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}