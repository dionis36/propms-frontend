import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const SearchAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: '',
    frequency: 'daily'
  });

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAlerts = [
          {
            id: 1,
            name: 'Downtown 2BR Under $3000',
            location: 'Downtown',
            minPrice: 2000,
            maxPrice: 3000,
            bedrooms: 2,
            propertyType: 'apartment',
            frequency: 'daily',
            isActive: true,
            matchCount: 12,
            createdAt: '2024-01-15',
            lastMatch: '2024-01-21T08:30:00Z'
          },
          {
            id: 2,
            name: 'Family Home in Suburbs',
            location: 'Suburbs',
            minPrice: 3000,
            maxPrice: 5000,
            bedrooms: 3,
            propertyType: 'house',
            frequency: 'weekly',
            isActive: true,
            matchCount: 5,
            createdAt: '2024-01-10',
            lastMatch: '2024-01-19T14:15:00Z'
          },
          {
            id: 3,
            name: 'Studio Near University',
            location: 'University District',
            minPrice: 1000,
            maxPrice: 1800,
            bedrooms: 1,
            propertyType: 'studio',
            frequency: 'instant',
            isActive: false,
            matchCount: 3,
            createdAt: '2024-01-05',
            lastMatch: '2024-01-18T11:20:00Z'
          }
        ];

        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    
    const alert = {
      id: Date.now(),
      ...newAlert,
      minPrice: parseInt(newAlert.minPrice) || 0,
      maxPrice: parseInt(newAlert.maxPrice) || 0,
      bedrooms: parseInt(newAlert.bedrooms) || 0,
      isActive: true,
      matchCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastMatch: null
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({
      name: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      propertyType: '',
      frequency: 'daily'
    });
    setShowCreateForm(false);
  };

  const handleToggleAlert = (alertId) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const handleDeleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'instant': return 'Instant';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      default: return frequency;
    }
  };

  const getPropertyTypeText = (type) => {
    switch (type) {
      case 'apartment': return 'Apartment';
      case 'house': return 'House';
      case 'condo': return 'Condo';
      case 'studio': return 'Studio';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-background p-4 rounded-lg">
              <div className="space-y-3">
                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
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
          <h1 className="text-xl font-semibold text-text-primary">Search Alerts</h1>
          <p className="text-text-secondary text-sm">
            {alerts.length} alerts created • {alerts.filter(a => a.isActive).length} active
          </p>
        </div>
        
        <Button
          variant="primary"
          iconName="Plus"
          onClick={() => setShowCreateForm(true)}
        >
          Create Alert
        </Button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="mb-6 bg-background border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-text-primary">Create New Alert</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Alert Name
                </label>
                <Input
                  type="text"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown 2BR Under $3000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  value={newAlert.location}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Downtown, Midtown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Min Price ($)
                </label>
                <Input
                  type="number"
                  value={newAlert.minPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, minPrice: e.target.value }))}
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Max Price ($)
                </label>
                <Input
                  type="number"
                  value={newAlert.maxPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="3000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bedrooms
                </label>
                <select
                  value={newAlert.bedrooms}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, bedrooms: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Property Type
                </label>
                <select
                  value={newAlert.propertyType}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Any Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Notification Frequency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['instant', 'daily', 'weekly'].map((freq) => (
                    <label key={freq} className="relative flex cursor-pointer">
                      <Input
                        type="radio"
                        name="frequency"
                        value={freq}
                        checked={newAlert.frequency === freq}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, frequency: e.target.value }))}
                        className="sr-only"
                      />
                      <div className={`flex-1 p-3 text-center rounded-md border-2 transition-all ${
                        newAlert.frequency === freq
                          ? 'border-primary bg-primary-50 text-primary' :'border-border text-text-secondary hover:border-secondary-300'
                      }`}>
                        <span className="text-sm font-medium">{getFrequencyText(freq)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary">
                Create Alert
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Bell" size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            No search alerts yet
          </h3>
          <p className="text-text-secondary mb-6">
            Create alerts to get notified when new properties match your criteria.
          </p>
          <Button
            variant="primary"
            iconName="Plus"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-background border rounded-lg p-4 transition-all ${
                alert.isActive ? 'border-border' : 'border-secondary-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-1">
                    {alert.name}
                  </h3>
                  <p className="text-text-secondary text-sm flex items-center">
                    <Icon name="MapPin" size={14} className="mr-1" />
                    {alert.location}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.isActive 
                      ? 'bg-success-100 text-success' :'bg-secondary-100 text-text-secondary'
                  }`}>
                    {alert.isActive ? 'Active' : 'Paused'}
                  </span>
                  
                  <button
                    onClick={() => handleToggleAlert(alert.id)}
                    className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                    title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                  >
                    <Icon name={alert.isActive ? 'Pause' : 'Play'} size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-1 text-text-secondary hover:text-error transition-colors"
                    title="Delete alert"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-text-secondary">Price Range:</span>
                  <p className="text-text-primary font-medium">
                    ${alert.minPrice?.toLocaleString() || '0'} - ${alert.maxPrice?.toLocaleString() || '∞'}
                  </p>
                </div>
                
                <div>
                  <span className="text-text-secondary">Bedrooms:</span>
                  <p className="text-text-primary font-medium">
                    {alert.bedrooms ? `${alert.bedrooms}+` : 'Any'}
                  </p>
                </div>
                
                <div>
                  <span className="text-text-secondary">Type:</span>
                  <p className="text-text-primary font-medium">
                    {alert.propertyType ? getPropertyTypeText(alert.propertyType) : 'Any'}
                  </p>
                </div>
                
                <div>
                  <span className="text-text-secondary">Frequency:</span>
                  <p className="text-text-primary font-medium">
                    {getFrequencyText(alert.frequency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span className="flex items-center">
                    <Icon name="Target" size={12} className="mr-1" />
                    {alert.matchCount} matches
                  </span>
                  <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                  {alert.lastMatch && (
                    <span>Last match: {new Date(alert.lastMatch).toLocaleDateString()}</span>
                  )}
                </div>
                
                <Button variant="outline" size="sm">
                  View Matches
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAlerts;