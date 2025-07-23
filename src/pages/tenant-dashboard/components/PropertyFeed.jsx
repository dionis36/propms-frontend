// pages/tenant-dashboard/components/PropertyFeed.jsx
import { useEffect, useState } from 'react';
import { getAllProperties } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function PropertyFeed() {
  const [properties, setProperties] = useState([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllProperties(accessToken);
        const filtered = data
          .filter(p => p.status === 'AVAILABLE')
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            name: p.title,
            status: 'Vacant',
            price: `TZS ${parseInt(p.price).toLocaleString()}`,
            // Get first valid image URL from media array
            imageUrl: p.media.find(m => m.image)?.image || null
          }));

        setProperties(filtered);
      } catch (error) {
        console.error('Failed to load property feed:', error);
      }
    };

    fetchData();
  }, [accessToken]);

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text-primary">New Vacant Properties</h2>
        <a href="/search" className="text-primary text-sm font-medium hover:underline">
          View All
        </a>
      </div>
      
      <div className="space-y-4">
        {properties.map(property => (
          <a 
            key={property.id}
            href={`http://localhost:4028/property-details?id=${property.id}`}
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
                <span className="text-success text-xs font-medium bg-success-100 px-2 py-1 rounded mr-2">
                  {property.status}
                </span>
                <span className="text-sm text-text-secondary">{property.price}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      
    </div>
  );
}