// pages/tenant-dashboard/components/ProfileQuickEdit.jsx
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../../components/ui/UserAvatar'; // Adjust the path as per your project structure
import StatusBadge from '../../../components/StatusBadge'; // Adjust the path as per your project structure  


export default function ProfileQuickEdit({ user }) {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/user-profile-settings');
  };

  // Helper function to format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const memberSinceDate = formatDate(user.date_joined);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Your Profile</h2>
      
      <div className="flex items-center mb-6">
        <UserAvatar firstName={user.first_name}  lastName={user.last_name} size="w-18 h-18 text-lg"/>
        <div className="ml-4">
          <h3 className="font-medium text-text-primary">{user.first_name} {user.last_name}</h3>
          <p className="text-xs text-text-secondary"><StatusBadge status={user?.role}></StatusBadge></p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Contact Email
          </label>
          <p className="text-text-primary">{user.email}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Phone Number
          </label>
          <p className="text-text-primary">{user.phone_number}</p>
        </div>
        
        {/* Moved the member since date here */}
        {memberSinceDate && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Member Since
            </label>
            <p className="text-text-primary">{memberSinceDate}</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
      <button
        className="text-white bg-primary w-full py-2 px-4 rounded-md"
        onClick={handleEditProfile}
      >
        Edit Profile
      </button>

      </div>
    </div>
  );
}
