// pages/tenant-dashboard/components/ProfileQuickEdit.jsx
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../../components/ui/UserAvatar'; // Adjust the path as per your project structure


export default function ProfileQuickEdit({ user }) {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/user-profile-settings');
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Your Profile</h2>
      
      <div className="flex items-center mb-6">
        <UserAvatar firstName={user.first_name}  lastName={user.last_name} size="w-18 h-18 text-lg"/>
        <div className="ml-4">
          <h3 className="font-medium text-text-primary">{user.first_name} {user.last_name}</h3>
          <p className="text-sm text-text-secondary">{user.role}</p>
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
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Rental Preferences
          </label>
          <p className="text-text-primary">2 Bedrooms • Pet Friendly • Downtown</p>
        </div>
      </div>
      
      <div className="mt-6">
      <button
        className="btn-secondary w-full py-2 px-4 rounded-md"
        onClick={handleEditProfile}
      >
        Edit Profile
      </button>

      </div>
    </div>
  );
}