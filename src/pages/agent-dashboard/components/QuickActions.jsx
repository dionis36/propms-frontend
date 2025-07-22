// pages/agent-dashboard/components/QuickActions.jsx
export default function QuickActions() {
  const actions = [
    { 
      title: "Add New Listing", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      link: "/property-create-edit"
    },
    { 
      title: "Edit My Profile", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      link: "/user-profile-settings"
    },
    {
      title: "Search Properties",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      link: "/property-listings"
    },
    {
      title: "View Saved Searches",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9a2 2 0 00-2-2h-7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13H3a2 2 0 00-2 2v4a2 2 0 002 2h2m0-12h2m-2 0V5a2 2 0 012-2h10a2 2 0 012 2v4" />
        </svg>
      ),
      link: "#"
    }
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <a 
            key={index}
            href={action.link}
            className="micro-interaction bg-surface border border-border rounded-lg p-4 text-center hover:shadow-elevation-2 transition-all"
          >
            <div className="mx-auto mb-2 bg-primary-100 rounded-full p-2 w-12 h-12 flex items-center justify-center">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-text-primary">{action.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}