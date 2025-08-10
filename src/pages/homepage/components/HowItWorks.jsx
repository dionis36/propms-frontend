import React from 'react';
import Icon from '../../../components/AppIcon';

// This component displays the "How it Works" section with a fixed background image.
// The design has been updated to be a responsive grid for the steps: 1x1 on mobile,
// 2x2 on medium screens, and 4x1 on large screens, with the quick stats details
// centered and simplified.
const HowItWorks = () => {
  // Array of steps for the "How it Works" section.
  const steps = [
    {
      id: 1,
      title: "Evaluate Property",
      icon: "Search",
      description: "Browse extensive listings with smart filters to find your ideal match effortlessly.",
      color: "text-primary",
    },
    {
      id: 2,
      title: "Meet Your Agent",
      icon: "Users",
      description: "Connect with our experienced agents who provide guidance through every step.",
      color: "text-accent",
    },
    {
      id: 3,
      title: "Close the Deal",
      icon: "Handshake",
      description: "Secure your property with a streamlined process and our expert support.",
      color: "text-success",
    },
    {
      id: 4,
      title: "Have Your Property",
      icon: "Home",
      description: "Enjoy your new home with ongoing support and full property management services.",
      color: "text-warning",
    }
  ];

  // Simplified details to be displayed at the bottom, mimicking the QuickStats component.
  const quickStatsDetails = [
    "Verified Listings",
    "24/7 Support",
    "Award Winning"
  ];

  return (
    <section 
      className="relative py-16 lg:py-24 overflow-hidden"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability and a fixed, immersive feel */}
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            How it Works
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Discover how simple it is to find and secure your perfect property in just four easy steps
          </p>
        </div>

        {/* Steps Grid - A flexible and responsive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-x-6 lg:gap-x-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 px-4 py-8 lg:py-12 mb-12 transition-all duration-300 ease-out hover:shadow-lg">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center justify-center text-center px-4">
              {/* Icon is now standalone, without a circular background, styled like the text */}
              <div className="mb-4">
                <Icon name={step.icon} size={32} className={`${step.color} drop-shadow-md`} />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-1">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-white/80 text-sm leading-relaxed max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Simplified details from QuickStats - now a single, centered, flex-wrapped line with dots as separate elements */}
        <div className="flex flex-wrap justify-center items-center text-center text-white/80">
          {quickStatsDetails.map((detail, index) => (
            <React.Fragment key={index}>
              <span className="text-sm font-medium mx-2">{detail}</span>
              {index < quickStatsDetails.length - 1 && (
                <span className="text-white/40">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-white/10 rounded-full animate-pulse opacity-50"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-primary/20 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-1/3 right-20 w-12 h-12 border border-accent/20 rotate-45 animate-spin-slow opacity-40"></div>

      {/* Custom CSS for the decorative animation */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
