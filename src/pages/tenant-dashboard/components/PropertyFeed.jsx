// pages/tenant-dashboard/components/PropertyFeed.jsx
import { Link } from 'react-router-dom'; // Import the Link component
import StatusBadge from '../../../components/StatusBadge';
import { useProperties } from '../../../hooks/useProperties'; // Import the new hook

export default function PropertyFeed() {
  const { data, isLoading, isError, error } = useProperties({
    page: 1,
    limit: 5, // Fetch only 5 properties for the feed
    filters: { status: 'AVAILABLE' }
  });

  const properties = data?.results
    .map(p => ({
      id: p.id,
      name: p.title,
      status: p.status,
      price: `TZS ${parseInt(p.price).toLocaleString()}`,
      imageUrl: p.media.find(m => m.image)?.image || null
    })) || [];

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">New Vacant Properties</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start animate-pulse">
              <div className="bg-gray-200 rounded-xl w-12 h-12 flex-shrink-0" />
              <div className="ml-3 w-full">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('Failed to load property feed:', error);
    return (
      <div className="card p-6 text-center text-red-500">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Error</h2>
        <p>Failed to load properties. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">New Vacant Properties</h2>
        {/* Use the Link component for client-side navigation */}
        <Link to="/property-listings" className="text-primary text-sm font-medium hover:underline">
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {properties.map(property => (
          <Link 
            key={property.id}
            to={`/property-details?id=${property.id}`}
              className="flex items-start hover:bg-gray-50 rounded-lg transition-colors duration-200 no-underline text-inherit"
          >
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.name} 
                className="rounded-xl w-12 h-12 flex-shrink-0 object-cover border border-gray-200"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex-shrink-0" />
            )}
            <div className="ml-3">
              <h3 className="font-medium text-text-primary">{property.name}</h3>
              <div className="flex items-center mt-1">
                <StatusBadge status={property.status} className="mr-2" />
                <span className="text-sm text-text-secondary">{property.price}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}