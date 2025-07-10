// pages/tenant-dashboard/components/PropertyFeed.jsx
export default function PropertyFeed() {
  const properties = [
    { id: 1, name: 'Lakeside Cottage', status: 'Vacant', price: '$1,650' },
    { id: 2, name: 'Urban Studio', status: 'Vacant', price: '$1,200' },
    { id: 3, name: 'Garden Apartment', status: 'Vacant', price: '$1,950' },
  ];

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
          <div key={property.id} className="flex items-start">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="font-medium text-text-primary">{property.name}</h3>
              <div className="flex items-center mt-1">
                <span className="text-success text-xs font-medium bg-success-100 px-2 py-1 rounded mr-2">
                  {property.status}
                </span>
                <span className="text-sm text-text-secondary">{property.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="btn-primary w-full py-2 px-4 rounded-md">
          Set Up Property Alerts
        </button>
      </div>
    </div>
  );
}