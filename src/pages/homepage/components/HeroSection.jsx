import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';

const HeroSection = ({ onSearch }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      alt: "Modern luxury home exterior"
    },
    {
      url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=2070&q=80",
      alt: "Beautiful residential neighborhood"
    },
    {
      url: "https://images.pixabay.com/photo/2016/06/24/10/47/house-1477041_1280.jpg?auto=compress&cs=tinysrgb&w=2070&q=80",
      alt: "Contemporary home with garden"
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isMounted) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isMounted, heroImages.length]);

  return (
    <section 
      className="relative inset-0 w-full h-full overflow-hidden z-10" 
      style={{ 
        height: '100vh',
        maxHeight: '-webkit-fill-available' // Fix mobile viewport height
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
              className="w-full h-full object-cover scale-105"
              priority={index === 0}
            />
          </div>
        ))}
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center pt-16 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center text-white mb-6 lg:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 lg:mb-4 font-heading tracking-tight">
              Find Your Dream Home
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/90 leading-relaxed">
              Discover the perfect property from thousands of listings across the country. 
              Your next home is just a search away.
            </p>
          </div>

          {/* Enhanced Quick Search Tags */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 px-2">
            {[
              'Apartments in NYC',
              'Houses under $500K',
              'Luxury Condos',
              'Pet-Friendly',
              'Waterfront'
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => onSearch({ query: tag })}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-lg text-white rounded-full text-xs sm:text-sm
                         hover:bg-white/30 transition-all duration-300 ease-out
                         border border-white/30 hover:scale-105 transform"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Combined Indicators Container */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Slide Indicators */}
        <div className="flex space-x-2 mb-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slim Scroll Indicator */}
        <div className="animate-bounce">
          <div className="w-5 h-8 rounded-full border border-white/50 flex justify-center">
            <div className="w-0.5 h-1.5 bg-white rounded-full mt-1.5 animate-scroll"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;