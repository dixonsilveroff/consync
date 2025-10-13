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
    quote: "The cost tracking features alone have saved us over $500K in the first year. ConSync is an essential tool for modern construction.",
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
      className={`glass-effect-strong rounded-2xl p-8 transform transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Quote Icon */}
      <div className="text-6xl text-blue-600/20 font-serif mb-4">"</div>
      
      {/* Quote Text */}
      <p className="text-gray-700 text-lg leading-relaxed mb-6">
        {testimonial.quote}
      </p>
      
      {/* Author Info */}
      <div className="flex items-center space-x-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.author}
          className="w-14 h-14 rounded-full border-2 border-blue-600/20"
        />
        <div>
          <div className="font-semibold text-gray-900">{testimonial.author}</div>
          <div className="text-sm text-gray-600">{testimonial.role}</div>
          <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
        </div>
      </div>
      
      {/* Decorative Element */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-600/10 to-indigo-500/10 rounded-full blur-xl" />
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-32 bg-gradient-to-b from-blue-50/30 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full mb-6">
            <span className="text-blue-600 font-semibold text-sm">TRUSTED BY INDUSTRY LEADERS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6">
            What Our Clients
            <br />
            <span className="text-gradient">Are Saying</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of construction professionals who have transformed their project management with ConSync.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}