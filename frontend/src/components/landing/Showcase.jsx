import { useEffect, useRef, useState } from 'react';

export default function Showcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative py-32 bg-white overflow-hidden"
    >
      {/* Diagonal Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-blue-100/50 to-transparent transform -skew-y-3" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Dashboard Mockup */}
          <div
            className={`relative transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="relative group">
              {/* Shimmer Effect Container */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1587401511935-a7f87afadf2f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBpbnRlcmZhY2UlMjBjaGFydHMlMjBkYXRhfGVufDB8MHx8Ymx1ZXwxNzYwMzYzNDE3fDA&ixlib=rb-4.1.0&q=85"
                  alt="KOBU Agency on Unsplash"
                  className="w-full h-auto rounded-2xl"
                />
                
                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl opacity-20 blur-2xl" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-tl from-indigo-500 to-blue-600 rounded-2xl opacity-20 blur-2xl" />
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 glass-effect-strong rounded-xl p-4 shadow-xl animate-float">
                <div className="text-2xl font-bold text-blue-600">↑ 24%</div>
                <div className="text-sm text-gray-600">Efficiency</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 glass-effect-strong rounded-xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-2xl font-bold text-green-600">✓ 100%</div>
                <div className="text-sm text-gray-600">On Track</div>
              </div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div
            className={`space-y-8 transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="inline-block px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full">
              <span className="text-blue-600 font-semibold text-sm">SEAMLESS INTEGRATION</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 leading-tight">
              Connecting Engineers,
              <br />
              <span className="text-gradient">Clients & Contractors</span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed">
              ConSync creates a unified workspace where all stakeholders can collaborate in real-time. 
              From initial design to final delivery, everyone stays informed and aligned.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: 'Unified Dashboard',
                  description: 'Single source of truth for all project information',
                },
                {
                  title: 'Real-time Updates',
                  description: 'Instant notifications keep everyone in sync',
                },
                {
                  title: 'Transparent Communication',
                  description: 'Clear visibility into project status and decisions',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-blue-50/30 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}