import { Link } from 'react-router-dom';
import ChevronDownIcon from '../icons/ChevronDownIcon';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-concrete via-white to-primary-lightest"
    >
      {/* Geometric Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#1E4E8C 1px, transparent 1px), linear-gradient(90deg, #1E4E8C 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Floating Geometric Shapes - Blueprint Inspired */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-lg blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-growth/5 rounded-lg blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Diagonal Accent Line */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-bl from-primary/10 to-transparent transform skew-x-12" />
      
      {/* Hexagonal Node Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary/10 shadow-sm">
              <div className="w-2 h-2 bg-growth rounded-full animate-pulse" />
              <span className="text-primary font-semibold text-sm">
                Transparency. Intelligence. Progress.
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
              <span className="text-steel">Building Smarter.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                Together.
              </span>
            </h1>
            
            <p className="text-xl text-steel-light leading-relaxed max-w-2xl">
              The complete construction lifecycle platform. From blueprints to delivery, 
              ConSync synchronizes every phase with intelligent project management built for 
              contractors, engineers, and clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="group px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-primary-light transform hover:-translate-y-1 transition-all duration-300 text-center relative overflow-hidden"
              >
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-6 text-sm text-steel-light">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-growth" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-growth" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Element with Modern Stats */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-cloud/30 transform hover:scale-[1.02] transition-transform duration-500">
              {/* Decorative Corner Accents */}
              <div className="absolute -top-1 -right-1 w-20 h-20 border-t-4 border-r-4 border-primary rounded-tr-3xl opacity-30" />
              <div className="absolute -bottom-1 -left-1 w-20 h-20 border-b-4 border-l-4 border-growth rounded-bl-3xl opacity-30" />
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-white to-concrete p-6 rounded-2xl shadow-sm border border-cloud/20 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-primary mb-2 font-display">50+</div>
                  <div className="text-steel text-sm font-medium">Active Projects</div>
                  <div className="mt-2 flex items-center gap-1 text-growth text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    <span>+24% this month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-concrete p-6 rounded-2xl shadow-sm border border-cloud/20 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-primary mb-2 font-display">99%</div>
                  <div className="text-steel text-sm font-medium">On-time Delivery</div>
                  <div className="mt-2 flex items-center gap-1 text-growth text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Industry leading</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-concrete p-6 rounded-2xl shadow-sm border border-cloud/20 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-primary mb-2 font-display">24/7</div>
                  <div className="text-steel text-sm font-medium">Real-time Sync</div>
                  <div className="mt-2 flex items-center gap-1 text-primary text-xs">
                    <div className="w-2 h-2 bg-growth rounded-full animate-pulse" />
                    <span>Live updates</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-concrete p-6 rounded-2xl shadow-sm border border-cloud/20 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl font-bold text-primary mb-2 font-display">₦3.5B</div>
                  <div className="text-steel text-sm font-medium">Managed Budget</div>
                  <div className="mt-2 flex items-center gap-1 text-growth text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span>Transparent tracking</span>
                  </div>
                </div>
              </div>

              {/* Featured Badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-growth/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-steel-dark font-semibold text-sm mb-1">Trusted by Industry Leaders</div>
                    <div className="text-steel-light text-xs">Join 500+ construction firms</div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-growth to-growth-light border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-signal to-signal-light border-2 border-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-cloud/30 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-growth to-growth-light flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-steel-dark font-bold text-sm">Project Complete</div>
                  <div className="text-steel-light text-xs">Site A - Phase 2</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-cloud/30 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-steel-dark font-bold text-sm">Efficiency +40%</div>
                  <div className="text-steel-light text-xs">vs last quarter</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#features"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-primary animate-bounce cursor-pointer hover:text-primary-light transition-colors duration-300"
      >
        <ChevronDownIcon width={32} height={32} />
      </a>
    </section>
  );
}