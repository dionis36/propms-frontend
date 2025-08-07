import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    properties: 0,
    cities: 0,
    transactions: 0,
    agents: 0
  });
  const sectionRef = useRef(null);

  const stats = [
    {
      key: 'properties',
      label: 'Active Properties',
      value: 15420,
      icon: 'Home',
      suffix: '+',
      color: 'text-primary',
      bgColor: 'bg-primary-100/40' // Increased opacity for prominence
    },
    {
      key: 'cities',
      label: 'Cities Covered',
      value: 250,
      icon: 'Map',
      suffix: '+',
      color: 'text-accent',
      bgColor: 'bg-accent-100/40' // Increased opacity for prominence
    },
    {
      key: 'transactions',
      label: 'Successful Sales',
      value: 8750,
      icon: 'Handshake',
      suffix: '+',
      color: 'text-success',
      bgColor: 'bg-success-100/40' // Increased opacity for prominence
    },
    {
      key: 'agents',
      label: 'Expert Agents',
      value: 1200,
      icon: 'UserCheck',
      suffix: '+',
      color: 'text-warning',
      bgColor: 'bg-warning-100/40' // Increased opacity for prominence
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 FPS
    const stepDuration = duration / steps;

    stats.forEach((stat) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(Math.floor(increment * currentStep), stat.value);
        
        setAnimatedValues(prev => ({
          ...prev,
          [stat.key]: currentValue
        }));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    });
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 lg:py-24 bg-background from-primary-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join our growing community of satisfied buyers, sellers, and agents who have found success through our platform
          </p>
        </div>

        {/* Stats - Modern horizontal bar with icons and numbers */}
<div className="grid grid-cols-2 gap-6 lg:flex lg:flex-row justify-center items-center lg:gap-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-elevation-1 px-4 py-8 lg:py-12 mb-12 transition-all duration-300 ease-out hover:shadow-elevation-1-5">
          {stats.map((stat, idx) => (
            <React.Fragment key={stat.key}>
              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                <div className={`w-16 h-16 mb-4 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon name={stat.icon} size={32} className={`${stat.color} drop-shadow-md`} />
                </div>
                <div className="flex items-end mb-1">
                  <span className="text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
                    {formatNumber(animatedValues[stat.key])}
                  </span>
                  <span className={`text-xl lg:text-2xl font-bold ${stat.color} ml-1`}>
                    {stat.suffix}
                  </span>
                </div>
                <span className="text-sm text-text-secondary font-medium">{stat.label}</span>
              </div>
              {idx < stats.length - 1 && (
                <div className="hidden lg:block h-16 border-l border-gray-200 mx-8" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Feature Highlights - horizontal, icon + text, no cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 bg-success-100/30 rounded-full flex items-center justify-center">
              <Icon name="ShieldCheck" size={24} className="text-success" />
            </span>
            <div>
              <p className="font-semibold text-text-primary">Verified Listings</p>
              <p className="text-sm text-text-secondary">All properties verified</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 bg-primary-100/30 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-primary" />
            </span>
            <div>
              <p className="font-semibold text-text-primary">24/7 Support</p>
              <p className="text-sm text-text-secondary">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 bg-accent-100/30 rounded-full flex items-center justify-center">
              <Icon name="Trophy" size={24} className="text-accent" />
            </span>
            <div>
              <p className="font-semibold text-text-primary">Award Winning</p>
              <p className="text-sm text-text-secondary">Industry recognized</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStats;