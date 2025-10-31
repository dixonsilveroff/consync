import { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    quote: "ConSync transformed how we manage on-site logistics. The real-time updates and transparent communication have reduced delays by 40%.",
    author: "Sarah Mitchell",
    role: "Project Manager",
    company: "BuildTech Solutions",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    quote: "Finally, a platform that brings all stakeholders together. Our clients love the transparency, and our team loves the efficiency.",
    author: "Michael Chen",
    role: "Senior Engineer",
    company: "Apex Construction",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    quote: "The cost tracking features alone have saved us over ₦20M in the first year. ConSync is an essential tool for modern construction.",
    author: "Jennifer Rodriguez",
    role: "Operations Director",
    company: "Metro Builders Inc",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

function TestimonialCard({ testimonial, index }) {
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

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-3xl p-8 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl border border-cloud/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] rounded-3xl overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#1E4E8C 1px, transparent 1px), linear-gradient(90deg, #1E4E8C 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Quote Icon */}
        <div className="mb-6">
          <svg className="w-12 h-12 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        
        {/* Quote Text */}
        <p className="text-steel-light text-lg leading-relaxed mb-6 font-medium">
          "{testimonial.quote}"
        </p>
        
        {/* Author Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              className="w-14 h-14 rounded-full border-2 border-primary/20"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-growth rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-steel-dark">{testimonial.author}</div>
            <div className="text-sm text-steel-light">{testimonial.role}</div>
            <div className="text-sm text-primary font-semibold">{testimonial.company}</div>
          </div>
        </div>
      </div>
      
      {/* Decorative Corner Element */}
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-primary/10 rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-growth/0 group-hover:from-primary/5 group-hover:to-growth/5 rounded-3xl transition-all duration-500" />
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32 bg-gradient-to-b from-concrete/30 via-white to-concrete/30 overflow-hidden">
      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#1E4E8C 1px, transparent 1px), linear-gradient(90deg, #1E4E8C 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-growth/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-primary/10 shadow-sm mb-6">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-growth to-growth-light border-2 border-white" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-signal to-signal-light border-2 border-white" />
            </div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              TRUSTED BY LEADERS
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-steel-dark mb-6">
            What Industry Experts
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              Are Saying
            </span>
          </h2>
          
          <p className="text-xl text-steel-light max-w-3xl mx-auto leading-relaxed">
            Join 500+ construction professionals who have transformed their project management workflow with ConSync.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Trust Bar */}
        <div className="mt-20 pt-12 border-t border-cloud/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Active Projects' },
              { value: '99%', label: 'On-time Delivery' },
              { value: '24/7', label: 'Real-time Sync' },
              { value: '₦3.5B', label: 'Managed Budget' },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl font-display font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-steel-light text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}