import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';

const HeroSection = ({ onSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Handle mobile viewport height
    const setVh = () => {
      document.documentElement.style.setProperty(
        '--vh', 
        `${window.innerHeight * 0.01}px`
      );
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const heroImages = [
    {
      url: "https://images.pexels.com/photos/358636/pexels-photo-358636.jpeg",
      alt: "Modern luxury home exterior"
    },
    {
      url: "https://images.pexels.com/photos/93375/pexels-photo-93375.jpeg",
      alt: "Beautiful residential neighborhood"
    },
    {
      url: "https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg",
      alt: "Contemporary home with garden"
    }
  ];

  // Auto-advance slides with pause on hover
  useEffect(() => {
    if (!isMounted) return;
    
    let interval;
    const carousel = document.getElementById('hero-carousel');
    
    const startInterval = () => {
      interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % heroImages.length);
      }, 6000);
    };
    
    startInterval();
    
    // Pause on hover for better UX
    const pause = () => clearInterval(interval);
    const resume = () => startInterval();
    
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('touchstart', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('touchend', resume);
    
    return () => {
      clearInterval(interval);
      carousel.removeEventListener('mouseenter', pause);
      carousel.removeEventListener('touchstart', pause);
      carousel.removeEventListener('mouseleave', resume);
      carousel.removeEventListener('touchend', resume);
    };
  }, [isMounted, heroImages.length]);

  // Text animation effect
  useEffect(() => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 10);
  }, [currentSlide]);

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch({ query: '' });
    } else {
      window.location.href = '/property-listings';
    }
  };

  return (
    <section 
      id="hero-carousel"
      className="relative w-full overflow-hidden z-10"
      style={{ 
        height: 'calc(var(--vh, 1dvh) * 100)',
        minHeight: '600px'
      }}
    >
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover transform scale-105 hover:scale-110 transition-transform duration-[8000ms] ease-out"
              priority={index === 0}
              loading="eager"
            />
          </div>
        ))}
        
        {/* Enhanced Darker Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/60"></div>
        
        {/* Animated particles overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/70 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/50 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-white/60 rounded-full animate-pulse delay-3000"></div>
          <div className="absolute top-1/2 left-1/6 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-primary/80 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-1/4 right-1/6 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-primary/60 rounded-full animate-pulse delay-1500"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 pt-32 pb-24">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
          <div className={`text-center text-white mb-6 sm:mb-8 lg:mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 font-heading tracking-tight leading-tight">
              Discover Quality <span className="text-primary relative">
                Rentals
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/50 animate-pulse hidden sm:block"></div>
              </span>
            </h1>
            <p className="text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">
              Finding a room, apartment, or house in Dar es Salaam just got easier.
              Your ideal home is just a search away.
            </p>
          </div>
          
          {/* Glass-style CTA Button */}
          <div className={`w-full max-w-md sm:max-w-lg transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleSearchClick}
              className="group relative overflow-hidden w-full bg-white/20 backdrop-blur-lg 
                         text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-semibold
                         transform hover:scale-105 transition-all duration-300 ease-out
                         border border-white/30 hover:border-white/50
                         hover:bg-white/30 shadow-xl hover:shadow-2xl"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              
              <span className="relative z-10 flex items-center justify-center">
                
                <svg className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Properties
              </span>
            </button>
            
            {/* Supporting text */}
            <p className="text-white/70 text-xs sm:text-sm text-center mt-3 font-light">
              Thousands of verified properties • Instant results
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Indicators Container */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Glass-style Slide Indicators */}
        <div className="flex space-x-2 mb-3 sm:mb-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative transition-all duration-300 backdrop-blur-sm ${
                index === currentSlide 
                  ? 'w-6 sm:w-8 h-2 sm:h-3 bg-white/90 border border-white/50 rounded-full scale-125' 
                  : 'w-2 sm:w-3 h-2 sm:h-3 bg-white/30 border border-white/20 hover:bg-white/50 hover:border-white/40 rounded-full hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>


        {/* Enhanced Scroll Indicator */}
        <div className="animate-bounce">
          <div className="w-4 sm:w-5 h-6 sm:h-8 rounded-full border border-white/50 flex justify-center relative overflow-hidden">
            <div className="w-0.5 h-1 sm:h-1.5 bg-white rounded-full mt-1 sm:mt-1.5 animate-scroll"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Floating elements for visual appeal - hidden on mobile */}
      <div className="absolute top-16 sm:top-20 left-4 sm:left-10 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 border border-white/20 rounded-full animate-float opacity-50 sm:opacity-100"></div>
      <div className="absolute top-32 sm:top-40 right-6 sm:right-16 w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-primary/20 rounded-full animate-float-delayed opacity-30 sm:opacity-100"></div>
      <div className="absolute bottom-24 sm:bottom-32 left-8 sm:left-20 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 border border-primary/30 rotate-45 animate-spin-slow opacity-40 sm:opacity-100 hidden sm:block"></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scroll {
          0% { opacity: 0; transform: translateY(-6px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(6px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite 2s;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;