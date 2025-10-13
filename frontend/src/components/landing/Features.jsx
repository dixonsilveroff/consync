import { useEffect, useRef, useState } from 'react';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';
import AutomationIcon from '../icons/AutomationIcon';
import CostChartIcon from '../icons/CostChartIcon';
import TeamIcon from '../icons/TeamIcon';

const features = [
  {
    icon: ClipboardCheckIcon,
    title: 'Project Tracking',
    description: 'Monitor every phase of your construction project with real-time updates and comprehensive dashboards.',
    color: 'from-blue-500 to-cyan-500',
    size: 'large',
  },
  {
    icon: AutomationIcon,
    title: 'Workflow Automation',
    description: 'Streamline repetitive tasks and optimize processes with intelligent automation.',
    color: 'from-purple-500 to-pink-500',
    size: 'medium',
  },
  {
    icon: CostChartIcon,
    title: 'Cost Transparency',
    description: 'Track expenses, manage budgets, and maintain complete financial visibility.',
    color: 'from-orange-500 to-red-500',
    size: 'medium',
  },
  {
    icon: TeamIcon,
    title: 'Real-time Collaboration',
    description: 'Connect engineers, contractors, and clients in one unified platform.',
    color: 'from-green-500 to-emerald-500',
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
      className={`group relative glass-effect-strong rounded-2xl p-8 transform transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${isLarge ? 'lg:col-span-2 lg:row-span-1' : 'lg:col-span-1'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
      
      {/* Icon */}
      <div className={`relative mb-6 inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        <Icon width={isLarge ? 40 : 32} height={isLarge ? 40 : 32} className="text-white" />
      </div>
      
      {/* Content */}
      <h3 className={`font-display font-bold text-gray-900 mb-4 ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
        {feature.title}
      </h3>
      <p className={`text-gray-600 leading-relaxed ${isLarge ? 'text-lg' : 'text-base'}`}>
        {feature.description}
      </p>
      
      {/* Decorative Corner */}
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-blue-600/20 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-32 bg-gradient-to-b from-white to-blue-50/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full mb-6">
            <span className="text-blue-600 font-semibold text-sm">POWERFUL FEATURES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6">
            Everything You Need to
            <br />
            <span className="text-gradient">Build Smarter</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ConSync brings together all the tools you need to manage construction projects efficiently and transparently.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}