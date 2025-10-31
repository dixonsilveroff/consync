import { useEffect, useRef, useState } from 'react';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';
import AutomationIcon from '../icons/AutomationIcon';
import CostChartIcon from '../icons/CostChartIcon';
import TeamIcon from '../icons/TeamIcon';

const features = [
  {
    icon: ClipboardCheckIcon,
    title: 'Project Lifecycle Tracking',
    description: 'Monitor every phase from design to delivery with real-time dashboards, milestone tracking, and intelligent progress indicators that keep all stakeholders aligned.',
    color: 'from-primary via-primary-light to-primary',
    bgColor: 'bg-primary/5',
    iconBg: 'bg-gradient-to-br from-primary to-primary-light',
    size: 'large',
  },
  {
    icon: AutomationIcon,
    title: 'Intelligent Automation',
    description: 'Streamline repetitive workflows with smart automation that adapts to your construction processes.',
    color: 'from-[#6366F1] via-[#8B5CF6] to-[#A855F7]',
    bgColor: 'bg-purple-500/5',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    size: 'medium',
  },
  {
    icon: CostChartIcon,
    title: 'Financial Transparency',
    description: 'Real-time budget tracking, cost breakdowns, and expense management with complete visibility across all project phases.',
    color: 'from-signal via-signal-light to-signal-dark',
    bgColor: 'bg-signal/5',
    iconBg: 'bg-gradient-to-br from-signal to-signal-dark',
    size: 'medium',
  },
  {
    icon: TeamIcon,
    title: 'Unified Collaboration',
    description: 'Connect contractors, engineers, and clients in one seamless platform. Share updates, documents, and decisions in real-time with role-based access control.',
    color: 'from-growth via-growth-light to-growth-dark',
    bgColor: 'bg-growth/5',
    iconBg: 'bg-gradient-to-br from-growth to-growth-dark',
    size: 'large',
  },
];

function FeatureCard({ feature, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const Icon = feature.icon;
  const isLarge = feature.size === 'large';

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-3xl p-8 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl border border-cloud/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${isLarge ? 'lg:col-span-2 lg:row-span-1' : 'lg:col-span-1'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
      
      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] rounded-3xl overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#1E4E8C 1px, transparent 1px), linear-gradient(90deg, #1E4E8C 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Icon */}
        <div className={`mb-6 inline-flex p-4 ${feature.iconBg} rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <Icon width={isLarge ? 40 : 32} height={isLarge ? 40 : 32} className="text-white" />
        </div>
        
        {/* Content */}
        <h3 className={`font-display font-bold text-steel-dark mb-4 ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
          {feature.title}
        </h3>
        <p className={`text-steel-light leading-relaxed ${isLarge ? 'text-lg' : 'text-base'}`}>
          {feature.description}
        </p>
        
        {/* Learn More Link */}
        <div className="mt-6 flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
          <span>Learn more</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {/* Decorative Corner */}
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-primary/10 rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-32 bg-gradient-to-b from-white via-concrete to-white overflow-hidden">
      {/* Background Blueprint Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#1E4E8C 1px, transparent 1px), linear-gradient(90deg, #1E4E8C 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Geometric Accent Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-growth/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-primary/10 shadow-sm mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              CORE CAPABILITIES
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-steel-dark mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              Build Smarter
            </span>
          </h2>
          
          <p className="text-xl text-steel-light max-w-3xl mx-auto leading-relaxed">
            ConSync brings together powerful tools designed specifically for construction project management, 
            creating a unified workspace that drives efficiency and transparency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Additional Value Props */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: 'Enterprise Security',
              description: 'Bank-level encryption and role-based access control',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Lightning Fast',
              description: 'Real-time updates with optimized performance',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Mobile Ready',
              description: 'Access from anywhere, on any device',
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-cloud/20 hover:shadow-lg transition-shadow duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-growth/10 rounded-xl flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <div>
                <h4 className="font-display font-bold text-steel-dark mb-2">{item.title}</h4>
                <p className="text-steel-light text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}