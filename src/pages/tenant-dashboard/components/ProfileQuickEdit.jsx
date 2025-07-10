// pages/tenant-dashboard/components/ProfileQuickEdit.jsx
export default function ProfileQuickEdit() {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Your Profile</h2>
      
      <div className="flex items-center mb-6">
        <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16" />
        <div className="ml-4">
          <h3 className="font-medium text-text-primary">Alex Morgan</h3>
          <p className="text-sm text-text-secondary">Verified Tenant</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Contact Email
          </label>
          <p className="text-text-primary">alex.morgan@example.com</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Phone Number
          </label>
          <p className="text-text-primary">(555) 123-4567</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Rental Preferences
          </label>
          <p className="text-text-primary">2 Bedrooms • Pet Friendly • Downtown</p>
        </div>
      </div>
      
      <div className="mt-6">
        <button className="btn-secondary w-full py-2 px-4 rounded-md">
          Edit Profile
        </button>
      </div>
    </div>
  );
}