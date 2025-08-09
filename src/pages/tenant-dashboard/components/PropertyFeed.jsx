// pages/tenant-dashboard/components/PropertyFeed.jsx
import { Link } from 'react-router-dom'; // Import the Link component
import StatusBadge from '../../../components/StatusBadge';
import { useProperties } from '../../../hooks/useProperties'; // Import the new hook

export default function PropertyFeed() {
  const { data, isLoading, isError, error } = useProperties({
    page: 1,
    limit: 6, // This tells the hook to request 6 items
    filters: { status: 'AVAILABLE' }
  });

  // We explicitly slice the array here to ensure only the first 5 items are displayed,
  // in case the API returns more than what was requested.
  const properties = data?.results
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.title,
      status: p.status,
      price: `TZS ${parseInt(p.price).toLocaleString()}`,
      imageUrl: p.media.find(m => m.image)?.image || null,
      location: p.location // Added location to the property object
    })) || [];

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">New Vacant Properties</h2>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => ( // Updated to show 6 loading skeletons
            <div key={i} className="flex items-start animate-pulse">
              <div className="bg-gray-200 rounded-xl w-12 h-12 flex-shrink-0" />
              <div className="ml-3 w-full">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card p-6 text-center text-text-danger">
        <h2 className="text-xl font-semibold mb-2">Error Loading Properties</h2>
        <p>Something went wrong: {error.message}</p>
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
              className="flex items-center hover:bg-gray-50 rounded-lg transition-colors duration-200 no-underline text-inherit"
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
            <div className="ml-3 overflow-hidden">
              <h3 className="font-medium text-text-primary">{property.name}</h3>
              <p className="text-sm text-text-tertiary mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{property.location}</p>
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
