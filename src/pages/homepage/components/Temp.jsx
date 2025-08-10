import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const sectionRef = useRef(null);
  const autoProgressRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: "Search & Filter",
      icon: "Search",
      description: "Browse thousands of verified properties with smart filters.",
      shortDesc: "Find properties that match your criteria",
      color: "text-primary",
      bgColor: "bg-primary-50",
      borderColor: "border-primary-200",
      accentColor: "bg-primary"
    },
    {
      id: 2,
      title: "Connect with Agents",
      icon: "Users", 
      description: "Get matched with experienced local agents instantly.",
      shortDesc: "Expert agents ready to help you",
      color: "text-accent",
      bgColor: "bg-accent-50",
      borderColor: "border-accent-200",
      accentColor: "bg-accent"
    },
    {
      id: 3,
      title: "Schedule Viewing",
      icon: "Calendar",
      description: "Book property visits at your convenience easily.",
      shortDesc: "View properties on your schedule",
      color: "text-success",
      bgColor: "bg-success-50",
      borderColor: "border-success-200",
      accentColor: "bg-success"
    },
    {
      id: 4,
      title: "Secure Your Home",
      icon: "Home",
      description: "Complete purchase with our secure process.",
      shortDesc: "Safe and secure transactions",
      color: "text-warning",
      bgColor: "bg-warning-50", 
      borderColor: "border-warning-200",
      accentColor: "bg-warning"
    }
  ];

  // Auto-progression with interaction pause
  const startAutoProgress = () => {
    if (autoProgressRef.current) clearInterval(autoProgressRef.current);
    if (!isInteracting && isVisible) {
      autoProgressRef.current = setInterval(() => {
        setActiveStep(prev => prev === 4 ? 1 : prev + 1);
      }, 4000);
    }
  };

  const stopAutoProgress = () => {
    if (autoProgressRef.current) clearInterval(autoProgressRef.current);
  };

  const handleStepClick = (stepId) => {
    setIsInteracting(true);
    setActiveStep(stepId);
    stopAutoProgress();
    // Resume auto-progress after 8 seconds of no interaction
    setTimeout(() => {
      setIsInteracting(false);
    }, 8000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      if (autoProgressRef.current) clearInterval(autoProgressRef.current);
    };
  }, []);

  useEffect(() => {
    if (isVisible && !isInteracting) {
      startAutoProgress();
    } else {
      stopAutoProgress();
    }
    return () => stopAutoProgress();
  }, [isVisible, isInteracting]);

  return (
    <section 
      ref={sectionRef}
      className="py-12 lg:py-24 bg-gradient-to-br from-primary-50 to-blue-50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile-First Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-primary/20 mb-3">
            <Icon name="Workflow" size={14} className="text-primary mr-1.5" />
            <span className="text-primary font-medium text-xs">Simple Process</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-heading">
            How it works
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-text-secondary max-w-xl mx-auto">
            Finding your perfect property in 4 simple steps
          </p>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          
          {/* Mobile: Visual First, Desktop: Right Side */}
          <div className="order-1 lg:order-2">
            <div className="relative max-w-sm mx-auto lg:max-w-none">
              {/* Main Visual Card - Mobile Optimized */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-elevation-2 border border-white/50 transition-all duration-700 ease-out">
                <div className="text-center">
                  {/* Large Icon - Responsive */}
                  <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center mx-auto mb-4 lg:mb-6 
                                  transition-all duration-700 ease-out transform
                                  ${steps.find(s => s.id === activeStep)?.accentColor} shadow-lg`}>
                    <Icon 
                      name={steps.find(s => s.id === activeStep)?.icon} 
                      size={window.innerWidth < 1024 ? 28 : 36} 
                      className="text-white" 
                    />
                  </div>

                  {/* Active Step Info - Mobile Optimized */}
                  <div className="mb-4 lg:mb-6">
                    <span className="text-xs lg:text-sm text-text-secondary font-medium">
                      Step {activeStep} of 4
                    </span>
                    <h3 className="text-lg lg:text-xl font-bold text-text-primary mt-1 transition-all duration-500">
                      {steps.find(s => s.id === activeStep)?.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-2 transition-all duration-500">
                      {steps.find(s => s.id === activeStep)?.shortDesc}
                    </p>
                  </div>

                  {/* Progress Indicator - Mobile Friendly */}
                  <div className="flex justify-center space-x-1.5 lg:space-x-2 mb-4 lg:mb-6">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`h-1.5 lg:h-2 rounded-full transition-all duration-700 ease-out
                                   ${activeStep >= step.id ? 'w-6 lg:w-8 bg-primary' : 'w-1.5 lg:w-2 bg-secondary-200'}`}
                      />
                    ))}
                  </div>

                  {/* Dynamic Features - Mobile Optimized */}
                  <div className="space-y-2 lg:space-y-3">
                    {activeStep === 1 && (
                      <div className="space-y-1.5 lg:space-y-2 opacity-0 animate-fadeIn">
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="MapPin" size={14} className="mr-1.5 text-primary flex-shrink-0" />
                          <span>15,000+ Properties</span>
                        </div>
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="Filter" size={14} className="mr-1.5 text-primary flex-shrink-0" />
                          <span>Smart Filters</span>
                        </div>
                      </div>
                    )}
                    {activeStep === 2 && (
                      <div className="space-y-1.5 lg:space-y-2 opacity-0 animate-fadeIn">
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="Star" size={14} className="mr-1.5 text-accent flex-shrink-0" />
                          <span>1,200+ Expert Agents</span>
                        </div>
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="MessageCircle" size={14} className="mr-1.5 text-accent flex-shrink-0" />
                          <span>Instant Communication</span>
                        </div>
                      </div>
                    )}
                    {activeStep === 3 && (
                      <div className="space-y-1.5 lg:space-y-2 opacity-0 animate-fadeIn">
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="Clock" size={14} className="mr-1.5 text-success flex-shrink-0" />
                          <span>Flexible Scheduling</span>
                        </div>
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="Video" size={14} className="mr-1.5 text-success flex-shrink-0" />
                          <span>Virtual Tours</span>
                        </div>
                      </div>
                    )}
                    {activeStep === 4 && (
                      <div className="space-y-1.5 lg:space-y-2 opacity-0 animate-fadeIn">
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="Shield" size={14} className="mr-1.5 text-warning flex-shrink-0" />
                          <span>100% Secure</span>
                        </div>
                        <div className="flex items-center justify-center text-xs lg:text-sm text-text-secondary">
                          <Icon name="FileText" size={14} className="mr-1.5 text-warning flex-shrink-0" />
                          <span>Legal Support</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Elements - Hidden on Small Mobile */}
              <div className="hidden sm:block absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="hidden sm:block absolute -bottom-2 -left-2 w-4 h-4 bg-accent/20 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Mobile: Steps Second, Desktop: Left Side */}
          <div className="order-2 lg:order-1">
            {/* Mobile: Vertical Stack, Desktop: 2x2 Grid */}
            <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`group cursor-pointer transition-all duration-500 ease-out
                             ${activeStep === step.id ? 'scale-102 lg:scale-105' : 'hover:scale-101 lg:hover:scale-102'}
                             transform-gpu`}
                  onClick={() => handleStepClick(step.id)}
                  onTouchStart={() => handleStepClick(step.id)}
                >
                  <div className={`relative bg-white/80 backdrop-blur-sm rounded-lg p-4 lg:p-5 border-2 
                                  transition-all duration-500 ease-out
                                  ${activeStep === step.id 
                                    ? `${step.borderColor} shadow-elevation-2 ${step.bgColor}` 
                                    : 'border-border/30 hover:border-primary/30 shadow-elevation-1 hover:shadow-elevation-1-5'
                                  }`}
                  >
                    {/* Active Indicator */}
                    {activeStep === step.id && (
                      <div className={`absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 ${step.accentColor} rounded-full
                                      flex items-center justify-center shadow-lg animate-pulse`}>
                        <Icon name="Check" size={10} className="text-white lg:w-3 lg:h-3" />
                      </div>
                    )}

                    {/* Mobile: Horizontal Layout, Desktop: Vertical Layout */}
                    <div className="flex lg:flex-col items-start lg:items-start space-x-3 lg:space-x-0 lg:space-y-3">
                      {/* Icon & Number Container */}
                      <div className="flex-shrink-0 lg:w-full">
                        <div className="flex lg:flex-col items-center lg:items-start space-x-2 lg:space-x-0 lg:space-y-2">
                          {/* Icon */}
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center 
                                          transition-all duration-500 ease-out
                                          ${activeStep === step.id 
                                            ? `${step.accentColor} text-white shadow-lg` 
                                            : `${step.bgColor} ${step.color}`
                                          }`}
                          >
                            <Icon name={step.icon} size={18} />
                          </div>
                          {/* Step Number */}
                          <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-xs font-bold
                                          transition-all duration-500 ease-out
                                          ${activeStep === step.id 
                                            ? 'bg-white text-text-primary shadow-md' 
                                            : 'bg-secondary-100 text-text-secondary'
                                          }`}
                          >
                            {step.id}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 lg:w-full">
                        <h3 className={`font-semibold text-sm lg:text-base mb-1 lg:mb-2 transition-colors duration-500
                                       ${activeStep === step.id ? step.color : 'text-text-primary'}`}>
                          {step.title}
                        </h3>
                        <p className="text-text-secondary text-xs lg:text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 lg:mt-4 h-0.5 lg:h-1 bg-secondary-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ease-out
                                      ${activeStep === step.id 
                                        ? `${step.accentColor} w-full` 
                                        : 'w-0'
                                      }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats - Mobile Optimized */}
        <div className="mt-8 lg:mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 
                          bg-white/80 backdrop-blur-sm rounded-full px-4 py-3 lg:px-8 lg:py-4 
                          border border-white/50 shadow-elevation-1">
            <div className="flex items-center space-x-1.5">
              <Icon name="Zap" size={16} className="text-primary" />
              <span className="text-xs lg:text-sm font-medium text-text-primary">7 days to close</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-secondary-300 rounded-full"></div>
            <div className="flex items-center space-x-1.5">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-xs lg:text-sm font-medium text-text-primary">98% satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .transform-gpu {
          transform: translateZ(0);
        }
        .scale-101 {
          transform: scale(1.01);
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;