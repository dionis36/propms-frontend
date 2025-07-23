// pages/agent-dashboard/components/QuickActions.jsx
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
      color: "primary"
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
      color: "accent"
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
      color: "success"
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
      color: "warning"
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-100 text-primary hover:bg-primary-200 border-primary-500',
      accent: 'bg-accent-100 text-accent-600 hover:bg-accent-200 border-accent-500',
      success: 'bg-success-100 text-success hover:bg-success-200 border-success-500',
      warning: 'bg-warning-100 text-warning hover:bg-warning-200 border-warning-500'
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary font-heading">
          Quick Actions
        </h3>
      </div>

      <div className="p-6">
        {/* Grid layout: 1 column on mobile, 2 columns on medium/wide screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.link}
              // Default (mobile): flex items-center (icon & title in row), text-left
              // Medium screens (md): flex-col (icon above title), justify-center, items-center, text-center
              className={`p-2 rounded-lg border transition-all duration-200 hover:shadow-elevation-2 micro-interaction
                flex items-center text-left
                md:flex-col md:justify-center md:items-center md:text-center
                ${getColorClasses(action.color)}`}
            >
              {/* Container for Icon and Title */}
              {/* Default (mobile): flex items-center space-x-3 (icon & title in row) */}
              {/* Medium screens (md): flex-col space-x-0 space-y-2 (icon above title), mb-2 for spacing */}
              <div className="flex items-center space-x-3 mb-2
                          md:flex-col md:space-x-0 md:space-y-2 md:mb-4"> {/* Increased mb for better spacing when stacked */}
                {/* Icon */}
                <span className="flex-shrink-0 md:mx-auto"> {/* md:mx-auto to center icon when stacked */}
                  {action.icon}
                </span>
                {/* Title */}
                <span className="font-medium text-base text-text-primary-active">
                  {action.title}
                </span>
              </div>
              {/* Description: Visible on mobile, hidden on medium screens and up */}
              <p className="text-sm text-text-secondary md:hidden">
                {action.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
