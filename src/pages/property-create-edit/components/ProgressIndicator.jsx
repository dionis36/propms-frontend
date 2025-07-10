import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
  const stepIcons = {
    'Property Details': 'Home',
    'Location': 'MapPin',
    'Media Upload': 'Camera',
    'Specifications': 'Settings',
    'Review': 'Eye'
  }; 

  return (
    <div className="bg-surface border-b border-border py-4 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step} className="flex items-center">
                {/* Step Circle */}
                <div className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-primary border-primary text-white'
                        : isActive
                        ? 'border-primary bg-primary-50 text-primary' :'border-border bg-background text-text-secondary'
                    }`}
                  >
                    {isCompleted ? (
                      <Icon name="Check" size={16} className="text-white" />
                    ) : (
                      <Icon 
                        name={stepIcons[step] || 'Circle'} 
                        size={16} 
                        className={isActive ? 'text-primary' : 'text-text-secondary'} 
                      />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className={`ml-3 hidden md:block ${
                    isActive ? 'text-primary font-medium' : 'text-text-secondary'
                  }`}>
                    <p className="text-sm font-medium">{step}</p>
                    <p className="text-xs">Step {stepNumber}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                    stepNumber < currentStep ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Step Info */}
        <div className="md:hidden mt-3 text-center">
          <p className="text-sm font-medium text-primary">
            {steps[currentStep - 1]}
          </p>
          <p className="text-xs text-text-secondary">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-secondary">
            <span>0%</span>
            <span className="text-primary font-medium">
              {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;