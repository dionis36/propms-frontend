// pages/agent-dashboard/components/WelcomeBanner.jsx
import StatusBadge from '../../../components/StatusBadge';

export default function WelcomeBanner({ name, user }) {
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
        
        <div className="mt-4 md:mt-0">
          <StatusBadge status={user?.is_verified ? 'VERIFIED' : 'UNVERIFIED'} />
        </div>
      </div>
      
     {!user?.is_verified && (
        <div className="bg-warning-100 text-warning rounded-lg px-4 py-2 mt-4">
          <p className="font-medium">
            <strong>⏳ Awaiting Verification:</strong> Your account is pending broker approval.
            You won't be able to upload properties until verified.
          </p>
        </div>
      )}

    </div>
  );
}

{/* 
********** USAGE ************* 

import StatusBadge from '../src/components/StatusBadge'; // Adjust path as needed


<p>Status: <StatusBadge status={property.status} /></p>
<p>User Role: <StatusBadge status="ADMIN" className="mt-2" /></p>
<p>Verification: <StatusBadge status="UNVERIFIED" /></p> 

*/}