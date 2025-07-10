import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ViewingHistory = () => {
  const [viewedProperties, setViewedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    const fetchViewingHistory = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockHistory = [
          {
            id: 1,
            title: 'Modern Downtown Apartment',
            location: '123 Main St, Downtown',
            price: 2500,
            bedrooms: 2,
            bathrooms: 2,
            sqft: 1200,
            image: '/assets/images/no_image.png',
            viewedAt: '2024-01-21T10:30:00Z',
            viewCount: 3,
            timeSpent: '8 min',
            status: 'VACANT',
            isSaved: true
          },
          {
            id: 2,
            title: 'Spacious Family Home',
            location: '456 Oak Ave, Suburbs',
            price: 3500,
            bedrooms: 4,
            bathrooms: 3,
            sqft: 2200,
            image: '/assets/images/no_image.png',
            viewedAt: '2024-01-20T15:45:00Z',
            viewCount: 1,
            timeSpent: '12 min',
            status: 'VACANT',
            isSaved: false
          },
          {
            id: 3,
            title: 'Cozy Studio Loft',
            location: '789 Pine St, Arts District',
            price: 1800,
            bedrooms: 1,
            bathrooms: 1,
            sqft: 750,
            image: '/assets/images/no_image.png',
            viewedAt: '2024-01-19T09:15:00Z',
            viewCount: 2,
            timeSpent: '5 min',
            status: 'OCCUPIED',
            isSaved: true
          },
          {
            id: 4,
            title: 'Luxury Penthouse Suite',
            location: '321 High St, Downtown',
            price: 5500,
            bedrooms: 3,
            bathrooms: 3,
            sqft: 1800,
            image: '/assets/images/no_image.png',
            viewedAt: '2024-01-18T14:20:00Z',
            viewCount: 1,
            timeSpent: '15 min',
            status: 'VACANT',
            isSaved: false
          }
        ];

        setViewedProperties(mockHistory);
      } catch (error) {
        console.error('Failed to fetch viewing history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViewingHistory();
  }, []);

  const handleSaveProperty = (propertyId) => {
    setViewedProperties(prev =>
      prev.map(p =>
        p.id === propertyId ? { ...p, isSaved: !p.isSaved } : p
      )
    );
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const viewed = new Date(timestamp);
    const diffInHours = Math.floor((now - viewed) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  const filteredProperties = viewedProperties.filter(property => {
    const viewedDate = new Date(property.viewedAt);
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        return viewedDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return viewedDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return viewedDate >= monthAgo;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background p-4 rounded-lg">
              <div className="flex space-x-4">
                <div className="w-20 h-16 bg-secondary-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Viewing History</h1>
          <p className="text-text-secondary text-sm">
            {viewedProperties.length} properties viewed • {filteredProperties.length} shown
          </p>
        </div>
        
        {viewedProperties.length > 0 && (
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-2 bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        )}
      </div>

      {/* History List */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Clock" size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {timeFilter === 'all' ? 'No viewing history yet' : `No properties viewed ${timeFilter === 'today' ? 'today' : 'in this period'}`}
          </h3>
          <p className="text-text-secondary mb-6">
            {timeFilter === 'all' ?'Properties you view will appear here for easy reference.' :'Try selecting a different time period or browse new properties.'
            }
          </p>
          <Link to="/property-listings">
            <Button variant="primary" iconName="Search">
              Browse Properties
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-background border border-border rounded-lg p-4 hover:shadow-elevation-1 transition-shadow"
            >
              <div className="flex space-x-4">
                {/* Property Image */}
                <div className="w-20 h-16 flex-shrink-0">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>

                {/* Property Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-medium text-text-primary mb-1 truncate">
                        {property.title}
                      </h3>
                      <p className="text-text-secondary text-sm flex items-center">
                        <Icon name="MapPin" size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        property.status === 'VACANT' ?'bg-success-100 text-success' :'bg-warning-100 text-warning'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-text-secondary">
                      <span className="flex items-center">
                        <Icon name="Bed" size={12} className="mr-1" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Bath" size={12} className="mr-1" />
                        {property.bathrooms}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Square" size={12} className="mr-1" />
                        {property.sqft} sqft
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-semibold text-primary">
                        ${property.price.toLocaleString()}/mo
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveProperty(property.id)}
                          className={`p-1 rounded transition-colors ${
                            property.isSaved
                              ? 'text-primary hover:text-primary-700' :'text-text-secondary hover:text-primary'
                          }`}
                          title={property.isSaved ? 'Remove from saved' : 'Save property'}
                        >
                          <Icon name="Heart" size={16} fill={property.isSaved} />
                        </button>
                        <Link to={`/property-details?id=${property.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center space-x-4">
                        <span>{getTimeAgo(property.viewedAt)}</span>
                        <span>Viewed {property.viewCount} times</span>
                        <span>Time spent: {property.timeSpent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewingHistory;