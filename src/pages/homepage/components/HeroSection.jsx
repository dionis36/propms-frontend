import React, { useState, useEffect } from 'react';
import Image from '../../../components/AppImage';
import SearchInterface from '../../../components/ui/SearchInterface';

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

  return (
    <section 
      id="hero-carousel"
      className="relative w-full overflow-hidden z-10"
      style={{ 
        height: 'calc(var(--vh, 1vh) * 100)',
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
              className="w-full h-full object-cover"
              priority={index === 0}
              loading="eager"
            />
          </div>
        ))}
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 pt-16 pb-24">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
          <div className={`text-center text-white mb-8 lg:mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 lg:mb-6 font-heading tracking-tight leading-tight">
              Find Your <span className="text-primary">Dream Home</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto text-white/90 leading-relaxed">
              Discover the perfect property from thousands of exclusive listings. 
              Your next chapter begins here.
            </p>
          </div>
          
          {/* Search Interface */}
          <div className="w-full max-w-3xl mt-4">
            <SearchInterface variant="hero" onSearch={onSearch} />
          </div>
        </div>
      </div>

      {/* Indicators Container */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
        {/* Slide Indicators */}
        <div className="flex space-x-2 mb-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        {/* <div className="animate-bounce-slow">
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/80 mb-1">Explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-1 animate-scroll"></div>
            </div>
          </div>
        </div> */}
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