// src/pages/property-details/components/ImageGallery.jsx
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageGallery = ({ images = [], title, virtualTour, video }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [viewMode, setViewMode] = useState('images'); // 'images' or 'videos'
  const thumbnailsRef = useRef(null);

  const minSwipeDistance = 50;
  
  // Convert video prop to array if it exists
  const videos = video ? (Array.isArray(video) ? video : [video]) : [];
  const hasVideos = videos.length > 0;

  const handlePrevious = () => {
    if (viewMode === 'images') {
      setCurrentImageIndex(prev => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    } else {
      setCurrentVideoIndex(prev => 
        prev === 0 ? videos.length - 1 : prev - 1
      );
    }
  };

  const handleNext = () => {
    if (viewMode === 'images') {
      setCurrentImageIndex(prev => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentVideoIndex(prev => 
        prev === videos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleThumbnailClick = (index) => {
    if (viewMode === 'images') {
      setCurrentImageIndex(index);
    } else {
      setCurrentVideoIndex(index);
    }
    
    // Scroll thumbnail into view
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[index];
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  const handleViewModeSwitch = (mode) => {
    setViewMode(mode);
    // Reset indices when switching modes
    if (mode === 'images') {
      setCurrentImageIndex(0);
    } else {
      setCurrentVideoIndex(0);
    }
  };

  const handleKeyDown = (e) => {
    if (isFullscreen) {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setIsFullscreen(false);
    }
  };

  const handleTouchStart = (e) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrevious();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (!images?.length && !hasVideos) {
    return (
      <div className="w-full h-64 md:h-96 bg-secondary-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon name="ImageOff" size={48} className="text-secondary mx-auto mb-2" />
          <p className="text-text-secondary">No media available</p>
        </div>
      </div>
    );
  }

  const currentMedia = viewMode === 'images' ? images : videos;
  const currentIndex = viewMode === 'images' ? currentImageIndex : currentVideoIndex;
  const totalItems = viewMode === 'images' ? images.length : videos.length;

  return (
    <div className="space-y-4">
      

      {/* Main Media Display */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-lg bg-surface">
        {viewMode === 'images' ? (
          <Image
            src={images[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : (
          <video
            key={videos[currentVideoIndex]}
            src={videos[currentVideoIndex]}
            controls
            className="w-full h-full object-cover"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Navigation Arrows */}
        {totalItems > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200 shadow-lg backdrop-blur-sm"
              aria-label={`Previous ${viewMode === 'images' ? 'image' : 'video'}`}
            >
              <Icon name="ChevronLeft" size={20} className="md:w-6 md:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200 shadow-lg backdrop-blur-sm"
              aria-label={`Next ${viewMode === 'images' ? 'image' : 'video'}`}
            >
              <Icon name="ChevronRight" size={20} className="md:w-6 md:h-6" />
            </button>
          </>
        )}

        {/* Media Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-md text-sm font-medium backdrop-blur-sm">
          {currentIndex + 1} / {totalItems}
        </div>

        {/* Current Media Indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 text-white px-3 py-1.5 rounded-md text-xs font-medium backdrop-blur-sm">
          <Icon 
            name={viewMode === 'images' ? 'Image' : 'Play'} 
            size={14} 
          />
          <span className="capitalize">{viewMode === 'images' ? 'Photo' : 'Video'}</span>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          {virtualTour && (
            <button
              onClick={() => window.open(virtualTour, '_blank')}
              className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-sm"
            >
              <Icon name="Camera" size={16} />
              <span className="hidden sm:inline">Virtual Tour</span>
            </button>
          )}
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-sm"
            aria-label="View fullscreen"
          >
            <Icon name="Maximize" size={16} />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {totalItems > 1 && (
        <div className="relative">
          <div 
            ref={thumbnailsRef}
            className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar"
          >
            {currentMedia.map((mediaItem, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden transition-all duration-200 relative ${
                  index === currentIndex
                    ? 'ring-2 ring-primary shadow-elevation-2'
                    : 'hover:shadow-elevation-1'
                }`}
              >
                {viewMode === 'images' ? (
                  <Image
                    src={mediaItem}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={mediaItem}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Icon name="Play" size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* View Mode Toggle */}
      {images?.length > 0 && hasVideos && (
        <div className="flex items-center justify-center">
          <div className="flex bg-secondary-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeSwitch('images')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'images'
                  ? 'bg-surface text-text shadow-elevation-1'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Icon name="Image" size={16} />
              <span>Photos</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {images.length}
              </span>
            </button>
            <button
              onClick={() => handleViewModeSwitch('videos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'videos'
                  ? 'bg-surface text-text shadow-elevation-1'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <Icon name="Play" size={16} />
              <span>Videos</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {videos.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-modal">
          <div className="relative w-full h-full flex items-center justify-center">
            {viewMode === 'images' ? (
              <Image
                src={images[currentImageIndex]}
                alt={`${title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            ) : (
              <video
                key={videos[currentVideoIndex]}
                src={videos[currentVideoIndex]}
                controls
                className="max-w-full max-h-full"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                Your browser does not support the video tag.
              </video>
            )}
            
            {/* Enhanced Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-all duration-200 backdrop-blur-sm shadow-lg group z-10"
              aria-label="Close fullscreen"
            >
              <Icon name="X" size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            
            {/* Navigation */}
            {totalItems > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-all duration-200 backdrop-blur-sm shadow-lg group"
                  aria-label={`Previous ${viewMode === 'images' ? 'image' : 'video'}`}
                >
                  <Icon name="ChevronLeft" size={28} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-all duration-200 backdrop-blur-sm shadow-lg group"
                  aria-label={`Next ${viewMode === 'images' ? 'image' : 'video'}`}
                >
                  <Icon name="ChevronRight" size={28} className="group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}
            
            {/* Enhanced Media Info Bar */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm shadow-lg flex items-center space-x-3">
              <Icon 
                name={viewMode === 'images' ? 'Image' : 'Play'} 
                size={16} 
              />
              <span className="capitalize">{viewMode === 'images' ? 'Photo' : 'Video'}</span>
              <span className="text-gray-300">|</span>
              <span>{currentIndex + 1} / {totalItems}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;