// pages/agent-dashboard/components/WelcomeBanner.jsx
export default function WelcomeBanner({ name, vacantListings }) {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('en-US', options);
  
  return (
    <div className="card p-6 bg-gradient-to-r from-primary-50 to-accent-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, <span className="text-primary">{name}</span> 👋
          </h1>
          <p className="text-text-secondary mt-1">
            {dateString}
          </p>
        </div>
        
        {vacantListings > 0 ? (
          <div className="mt-4 md:mt-0 bg-warning-100 text-warning rounded-lg px-4 py-2">
            <p className="font-medium">
              You have {vacantListings} vacant {vacantListings === 1 ? 'listing' : 'listings'}
            </p>
          </div>
        ) : (
          <div className="mt-4 md:mt-0 bg-success-100 text-success rounded-lg px-4 py-2">
            <p className="font-medium">
              All listings occupied! Great work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}