import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Icon from '../../../components/AppIcon';
import UserAvatar from '../../../components/ui/UserAvatar';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const AgentSpotlight = () => {
  const [openFlyoutId, setOpenFlyoutId] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const swiperRef = useRef(null);
  const flyoutRefs = useRef({});

  const topAgents = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Real Estate Agent",
      firstName: "Sarah",
      lastName: "Johnson",
      rating: 4.9,
      reviewCount: 127,
      location: "Manhattan, NY",
      phone: "+15551234567",
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Real Estate Specialist",
      firstName: "Michael",
      lastName: "Chen",
      rating: 4.8,
      reviewCount: 94,
      location: "Austin, TX",
      phone: "+15552345678",
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      title: "Luxury Property Consultant",
      firstName: "Elena",
      lastName: "Rodriguez",
      rating: 5.0,
      reviewCount: 156,
      location: "Miami, FL",
      phone: "+15553456789",
    },
    {
      id: 4,
      name: "David Kim",
      title: "Residential Sales Expert",
      firstName: "David",
      lastName: "Kim",
      rating: 4.7,
      reviewCount: 83,
      location: "Portland, OR",
      phone: "+15554567890",
    }
  ];

  useEffect(() => {
    if (swiperRef.current) {
      if (isHovered) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
    }
  }, [isHovered]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openFlyoutId) {
        const flyoutElement = flyoutRefs.current[openFlyoutId];
        if (flyoutElement && !flyoutElement.contains(e.target)) {
          setOpenFlyoutId(null);
          setCopiedPhone(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFlyoutId]);

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Icon 
        key={i}
        name="Star" 
        size={16} 
        className={i < Math.floor(rating) ? "text-warning" : "text-secondary-300"} 
        fill={i < rating ? "currentColor" : "none"}
      />
    ));
  };

  const copyToClipboard = (phone, agentId) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(agentId);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const toggleFlyout = (agentId) => {
    if (openFlyoutId === agentId) {
      setOpenFlyoutId(null);
      setCopiedPhone(null);
    } else {
      setOpenFlyoutId(agentId);
    }
  };

  const swiperOptions = {
    modules: [Navigation, Pagination, Autoplay],
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    allowTouchMove: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      reverseDirection: true
    },
    pagination: {
      clickable: true,
      el: '.swiper-pagination-custom',
      bulletClass: 'swiper-pagination-bullet-custom',
      bulletActiveClass: 'swiper-pagination-bullet-active-custom',
    },
    navigation: {
      nextEl: '.swiper-button-next-custom',
      prevEl: '.swiper-button-prev-custom',
    },
    breakpoints: {
      640: {
        navigation: {
          enabled: true,
        },
      },
      0: {
        navigation: {
          enabled: false,
        },
      },
    },
    onSwiper: (swiper) => {
      swiperRef.current = swiper;
    },
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 lg:items-center">
          {/* Left Column - Section Header */}
          <div className="lg:w-2/5 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-2 font-heading">
              Top Agents
            </h2>
            <p className="text-lg text-text-secondary">
              Connect with our exceptional real estate professionals who deliver outstanding results
            </p>
            
            {/* View all agents link */}
            <div className="mt-8">
              <Link
                to="/agent-dashboard"
                className="inline-flex items-center text-primary font-medium
                     transition-colors duration-200"
              >
                View all Agents
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Link>
            </div>
          </div>
                  
          {/* Right Column - Agent Swiper */}
          <div className="lg:w-3/5">
            <div 
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Swiper {...swiperOptions} className="agent-swiper">
                {topAgents.map((agent) => (
                  <SwiperSlide key={agent.id}>
                    <div className="px-4">
                      <div className="p-4 text-center transition-all duration-300">
                        {/* Centered Avatar */}
                        <div className="flex justify-center mb-3">
                          <UserAvatar
                            firstName={agent.firstName}
                            lastName={agent.lastName}
                            className="text-2xl w-20 h-20 border-2 border-white shadow-sm"
                          />
                        </div>
                        
                        {/* Agent Info */}
                        <div className="mb-3">
                          <h3 className="text-xl font-semibold text-text-primary mb-0.5">
                            {agent.name}
                          </h3>
                          <p className="text-primary text-sm font-medium mb-1">
                            {agent.title}
                          </p>
                          <p className="text-text-secondary text-sm flex items-center justify-center">
                            <Icon name="MapPin" size={14} className="mr-1" />
                            {agent.location}
                          </p>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex justify-center items-center mb-4">
                          <div className="flex space-x-0.5 mr-2">
                            {renderStars(agent.rating)}
                          </div>
                          <span className="text-xs text-text-secondary">
                            ({agent.reviewCount} reviews)
                          </span>
                        </div>
                        
                        {/* Contact Button & Flyout */}
                        <div className="relative">
                          <button 
                            onClick={() => toggleFlyout(agent.id)}
                            className="w-[90%] lg:w-[50%] py-3 px-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium
                                hover:from-blue-600 hover:to-primary transform hover:scale-102 transition-all duration-300 shadow-lg hover:shadow-xl
                                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                          >
                            Contact
                          </button>
                          
                          {openFlyoutId === agent.id && (
                            <div 
                              ref={el => flyoutRefs.current[agent.id] = el}
                              className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-surface rounded-lg shadow-lg border border-border/50"
                            >
                              <div className="p-2">
                                <div className="flex items-center justify-between p-2 border-b border-border/30">
                                  <span className="text-sm font-medium text-text-primary">Contact options</span>
                                  <button 
                                    onClick={() => setOpenFlyoutId(null)}
                                    className="text-text-secondary hover:text-text-primary"
                                  >
                                    <Icon name="X" size={16} />
                                  </button>
                                </div>
                                
                                <div className="py-2">
                                  <button
                                    onClick={() => copyToClipboard(agent.phone, agent.id)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-sm text-text-secondary hover:bg-secondary-100 hover:text-text-primary transition-colors rounded-md"
                                  >
                                    <span className="font-mono text-xs">{agent.phone}</span>
                                    <div className="flex items-center">
                                      {copiedPhone === agent.id ? (
                                        <Icon name="Check" size={16} className="text-success" />
                                      ) : (
                                        <Icon name="Copy" size={16} className="text-primary" />
                                      )}
                                    </div>
                                  </button>
                                  
                                  <a 
                                    href={`https://wa.me/${agent.phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:bg-secondary-100 hover:text-text-primary transition-colors"
                                  >
                                    <Icon name="MessageCircle" size={16} className="mr-2 text-success" />
                                    WhatsApp
                                  </a>
                                  
                                  <a 
                                    href={`tel:${agent.phone}`}
                                    className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:bg-secondary-100 hover:text-text-primary transition-colors"
                                  >
                                    <Icon name="Phone" size={16} className="mr-2 text-primary" />
                                    Call now
                                  </a>
                                  
                                  <a 
                                    href={`sms:${agent.phone}`}
                                    className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:bg-secondary-100 hover:text-text-primary transition-colors"
                                  >
                                    <Icon name="MessageSquare" size={16} className="mr-2 text-accent" />
                                    Send message
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Navigation Arrows - Hidden on mobile */}
              <div className="swiper-button-prev-custom hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 items-center justify-center hover:bg-white/20 rounded-full transition-all duration-300 cursor-pointer z-10 group">
                <Icon name="ChevronLeft" size={18} className="text-gray-500 group-hover:text-primary transition-colors duration-300" />
              </div>
              
              <div className="swiper-button-next-custom hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 items-center justify-center hover:bg-white/20 rounded-full transition-all duration-300 cursor-pointer z-10 group">
                <Icon name="ChevronRight" size={18} className="text-gray-500 group-hover:text-primary transition-colors duration-300" />
              </div>
            </div>
            
            {/* Custom Pagination */}
            <div className="swiper-pagination-custom flex justify-center mt-6 space-x-2"></div>
          </div>
        </div>

        {/* Custom Swiper Styles */}
        <style jsx>{`
            .agent-swiper {
                padding: 0 20px;
            }
            
            .swiper-pagination-bullet-custom {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #e2e8f0; /* Simple light gray */
                opacity: 1;
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .swiper-pagination-bullet-active-custom {
                background: #3b82f6; /* A solid blue for active state */
                transform: scale(1.2);
            }
            
            .swiper-pagination-bullet-custom:hover {
                transform: scale(1.1);
            }
            
            .swiper-pagination-bullet-active-custom:hover {
                transform: scale(1.2);
            }
            
            @media (max-width: 640px) {
                .agent-swiper {
                    padding: 0 10px;
                }
            }
        `}</style>

      </div>
    </section>
  );
};

export default AgentSpotlight;