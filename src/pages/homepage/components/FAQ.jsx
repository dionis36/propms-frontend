import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Do you provide a complete design style?",
      answer: "Yes, we offer comprehensive design styles that include color palettes, typography, and component libraries to ensure a cohesive look and feel across your entire application."
    },
    {
      question: "How was the license?",
      answer: "Our platform operates under a flexible commercial license that allows both personal and commercial use. You can review our licensing terms in detail on our legal documentation page."
    },
    {
      question: "How much we can buy this marvelous product?",
      answer: "Our pricing is tier-based depending on your needs. We offer a free starter plan, a professional plan at $49/month, and an enterprise solution with custom pricing. All plans include full access to our property listings."
    },
    {
      question: "Do you have any terms & conditions?",
      answer: "Yes, we have comprehensive terms and conditions that govern the use of our platform. These cover user responsibilities, data privacy, payment terms, and intellectual property rights. You can find them in the footer of every page."
    },
    {
      question: "How do I contact support?",
      answer: "Our support team is available 24/7 through live chat, email at support@estatehub.com, or phone at +1-800-555-REAL. We typically respond within 1 hour during business hours."
    },
    {
      question: "Can I list multiple properties?",
      answer: "Absolutely! Our platform allows you to list unlimited properties. We offer bulk upload tools and CSV import options to make managing multiple listings efficient."
    }
  ];

return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Layout - FAQ on left, Header on right */}
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 lg:items-center">
                {/* Section Header - Top on mobile, right on desktop */}
                <div className="lg:order-2 lg:w-2/5 mb-6 lg:mb-0">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-text-secondary mb-8">
                            Find answers to common questions about our platform and services
                        </p>
                        
                        {/* Support Card - Hidden on mobile, shown on desktop */}
                        <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-xl shadow-elevation-1 p-6 mt-8 w-full max-w-md lg:max-w-none">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Icon name="Headphones" size={24} className="text-primary" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xl font-semibold text-text-primary mb-2">Need more help?</h3>
                                    <p className="text-text-secondary mb-4">
                                        Our support team is available 24/7 to assist you with any questions.
                                    </p>
                                    <a
                                        href="/contact"
                                        className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
                                    >
                                        Contact Support
                                        <Icon name="ArrowRight" size={18} className="ml-2" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Left Column - FAQ Items */}
                <div className="lg:order-1 lg:w-3/5">
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index}
                                className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-elevation-1 overflow-hidden
                                                     transition-all duration-300 ease-out ${
                                                         activeIndex === index 
                                                             ? 'ring-2 ring-primary-200 shadow-elevation-2' 
                                                             : 'hover:shadow-elevation-1-5'
                                                     }`}
                            >
                                <button 
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full p-5 lg:p-6 text-left flex justify-between items-center gap-4"
                                    aria-expanded={activeIndex === index}
                                    aria-controls={`faq-content-${index}`}
                                >
                                    <span className="text-lg font-medium text-text-primary">
                                        {faq.question}
                                    </span>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                                                    ${activeIndex === index ? 'bg-primary-100 text-primary' : 'bg-secondary-100 text-text-secondary'}`}>
                                        <Icon 
                                            name={activeIndex === index ? "Minus" : "Plus"} 
                                            size={16} 
                                        />
                                    </div>
                                </button>
                                
                                <div 
                                    id={`faq-content-${index}`}
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-0 border-t border-border/30">
                                        <p className="text-text-secondary">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Support Card for mobile - Shows below FAQs */}
                    <div className="lg:hidden bg-white/80 backdrop-blur-sm rounded-xl shadow-elevation-1 p-6 mt-6 w-full">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <Icon name="Headphones" size={24} className="text-primary" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-xl font-semibold text-text-primary mb-2">Need more help?</h3>
                                <p className="text-text-secondary mb-4">
                                    Our support team is available 24/7 to assist you with any questions.
                                </p>
                                <a
                                    href="/contact"
                                    className="inline-flex items-center text-primary font-medium hover:text-primary-700 transition-colors"
                                >
                                    Contact Support
                                    <Icon name="ArrowRight" size={18} className="ml-2" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);
};

export default FAQ;