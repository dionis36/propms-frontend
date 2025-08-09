// pages/agent-dashboard/components/QuickActions.jsx
import React from 'react';

// Tailwind CSS is used for all styling
export default function QuickActions() {
  const actions = [
    {
      title: "Add New Listing",
      description: "Create a new property listing",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      link: "/property-create-edit",
      iconColor: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      title: "Edit My Profile",
      description: "Update your profile information",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      link: "/user-profile-settings",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Search Properties",
      description: "Browse available properties",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      link: "/property-listings",
      iconColor: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "View Saved Searches",
      description: "Access your saved searches",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9a2 2 0 00-2-2h-7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13H3a2 2 0 00-2 2v4a2 2 0 002 2h2m0-12h2m-2 0V5a2 2 0 012-2h10a2 2 0 012 2v4" />
        </svg>
      ),
      link: "#",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-text-primary">
          Quick Actions
        </h3>
      </div>

      <div className="gap-6">
        {/* Responsive grid for actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.link}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md hover:bg-gray-50 text-center"
            >
              {/* Icon Container with colored background */}
              <div className={`p-2 rounded-full ${action.bgColor} mb-2`}>
                {/* The icon itself with the correct color */}
                <span className={action.iconColor}>{action.icon}</span>
              </div>
              {/* Title */}
              <span className="font-medium text-base text-text-primary-active">
                {action.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
