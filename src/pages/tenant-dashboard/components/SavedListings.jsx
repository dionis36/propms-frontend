// pages/tenant-dashboard/components/SavedListings.jsx
import EmptyState from './EmptyState';

export default function SavedListings() {
  const savedListings = []; // Replace with actual data

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Saved Properties</h2>
        <button className="btn-secondary text-sm px-4 py-2 rounded-md">
          View All
        </button>
      </div>

      {savedListings.length > 0 ? (
        <div className="space-y-4">
          {/* Sample Property Card - Repeat for each listing */}
          <div className="border border-border rounded-lg p-4 flex">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            <div className="ml-4">
              <h3 className="font-medium text-text-primary">Modern Downtown Loft</h3>
              <p className="text-sm text-text-secondary">$1,850/month • 2bd 1ba</p>
              <div className="flex mt-2">
                <span className="bg-success-100 text-success text-xs px-2 py-1 rounded mr-2">
                  Available Now
                </span>
                <span className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded">
                  Last viewed: 2 days ago
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState 
          title="No saved properties yet"
          description="Start saving properties you're interested in to see them here"
          actionText="Browse Properties"
        />
      )}
    </div>
  );
}