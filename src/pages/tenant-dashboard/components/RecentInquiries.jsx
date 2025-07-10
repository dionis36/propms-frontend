import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const RecentInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, responded, scheduled

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockInquiries = [
          {
            id: 1,
            propertyTitle: 'Modern Downtown Apartment',
            propertyLocation: '123 Main St, Downtown',
            propertyPrice: 2500,
            propertyImage: '/assets/images/no_image.png',
            broker: {
              name: 'John Smith',
              company: 'Premier Realty',
              phone: '+1 (555) 123-4567',
              email: 'john.smith@premier.com',
              avatar: null
            },
            inquiry: {
              message: 'Hi, I\'m interested in scheduling a viewing for this property. I\'m looking to move in by the end of next month. Could we arrange a tour this week?',
              sentAt: '2024-01-21T09:30:00Z',
              status: 'responded',
              responseAt: '2024-01-21T14:45:00Z',
              response: 'Thank you for your interest! I\'d be happy to show you the property. I have availability tomorrow at 2 PM or Thursday at 10 AM. Please let me know what works best for you.',
              scheduledViewing: '2024-01-22T14:00:00Z'
            }
          },
          {
            id: 2,
            propertyTitle: 'Spacious Family Home',
            propertyLocation: '456 Oak Ave, Suburbs',
            propertyPrice: 3500,
            propertyImage: '/assets/images/no_image.png',
            broker: {
              name: 'Sarah Johnson',
              company: 'Family Homes Inc',
              phone: '+1 (555) 987-6543',
              email: 'sarah.j@familyhomes.com',
              avatar: null
            },
            inquiry: {
              message: 'I\'m interested in this property for my family. We have two children and need a quiet neighborhood. Could you tell me more about the school district and local amenities?',
              sentAt: '2024-01-20T16:20:00Z',
              status: 'pending',
              responseAt: null,
              response: null,
              scheduledViewing: null
            }
          },
          {
            id: 3,
            propertyTitle: 'Luxury Penthouse Suite',
            propertyLocation: '321 High St, Downtown',
            propertyPrice: 5500,
            propertyImage: '/assets/images/no_image.png',
            broker: {
              name: 'Mike Wilson',
              company: 'Luxury Properties',
              phone: '+1 (555) 456-7890',
              email: 'mike.w@luxuryprops.com',
              avatar: null
            },
            inquiry: {
              message: 'I\'d like to know if this property allows pets. I have a small dog and want to make sure it\'s pet-friendly before scheduling a viewing.',
              sentAt: '2024-01-19T11:15:00Z',
              status: 'responded',
              responseAt: '2024-01-19T15:30:00Z',
              response: 'Yes, we do allow pets with a small additional deposit. The building is very pet-friendly with a dog park nearby. Would you like to schedule a viewing?',
              scheduledViewing: null
            }
          },
          {
            id: 4,
            propertyTitle: 'Cozy Studio Loft',
            propertyLocation: '789 Pine St, Arts District',
            propertyPrice: 1800,
            propertyImage: '/assets/images/no_image.png',
            broker: {
              name: 'Emma Davis',
              company: 'Urban Living',
              phone: '+1 (555) 234-5678',
              email: 'emma.d@urbanliving.com',
              avatar: null
            },
            inquiry: {
              message: 'Is this property still available? I\'m looking for something close to the metro station.',
              sentAt: '2024-01-18T08:45:00Z',
              status: 'scheduled',
              responseAt: '2024-01-18T12:20:00Z',
              response: 'Yes, it\'s still available! It\'s only a 3-minute walk to the metro. I can show it to you this Friday if you\'re interested.',
              scheduledViewing: '2024-01-26T15:00:00Z'
            }
          }
        ];

        setInquiries(mockInquiries);
      } catch (error) {
        console.error('Failed to fetch inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.inquiry.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-100 text-warning';
      case 'responded':
        return 'bg-success-100 text-success';
      case 'scheduled':
        return 'bg-primary-100 text-primary';
      default:
        return 'bg-secondary-100 text-text-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Response';
      case 'responded':
        return 'Responded';
      case 'scheduled':
        return 'Viewing Scheduled';
      default:
        return status;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const sent = new Date(timestamp);
    const diffInHours = Math.floor((now - sent) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
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
                <div className="h-16 bg-secondary-200 rounded"></div>
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
          <h1 className="text-xl font-semibold text-text-primary">Recent Inquiries</h1>
          <p className="text-text-secondary text-sm">
            {inquiries.length} total inquiries • {filteredInquiries.length} shown
          </p>
        </div>
        
        {inquiries.length > 0 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-2 bg-background text-text-primary focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Inquiries</option>
            <option value="pending">Pending Response</option>
            <option value="responded">Responded</option>
            <option value="scheduled">Viewing Scheduled</option>
          </select>
        )}
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageSquare" size={32} className="text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {filter === 'all' ? 'No inquiries yet' : `No ${filter} inquiries`}
          </h3>
          <p className="text-text-secondary mb-6">
            {filter === 'all' ?'When you contact brokers about properties, your inquiries will appear here.' :'Try selecting a different filter or browse properties to send new inquiries.'
            }
          </p>
          <Link to="/property-listings">
            <Button variant="primary" iconName="Search">
              Browse Properties
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-background border border-border rounded-lg p-6"
            >
              {/* Property Header */}
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={inquiry.propertyImage}
                  alt={inquiry.propertyTitle}
                  className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-text-primary mb-1">
                        {inquiry.propertyTitle}
                      </h3>
                      <p className="text-text-secondary text-sm flex items-center">
                        <Icon name="MapPin" size={14} className="mr-1" />
                        {inquiry.propertyLocation}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold text-primary">
                        ${inquiry.propertyPrice.toLocaleString()}/mo
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.inquiry.status)}`}>
                        {getStatusText(inquiry.inquiry.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Broker Info */}
              <div className="flex items-center space-x-3 mb-4 p-3 bg-secondary-50 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {inquiry.broker.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {inquiry.broker.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {inquiry.broker.company}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${inquiry.broker.phone}`}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                    title="Call broker"
                  >
                    <Icon name="Phone" size={16} />
                  </a>
                  <a
                    href={`mailto:${inquiry.broker.email}`}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                    title="Email broker"
                  >
                    <Icon name="Mail" size={16} />
                  </a>
                </div>
              </div>

              {/* Inquiry Message */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">Your Inquiry</span>
                  <span className="text-xs text-text-secondary">
                    {getTimeAgo(inquiry.inquiry.sentAt)}
                  </span>
                </div>
                <div className="bg-primary-50 p-3 rounded-lg">
                  <p className="text-sm text-text-primary">{inquiry.inquiry.message}</p>
                </div>
              </div>

              {/* Broker Response */}
              {inquiry.inquiry.response && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">Broker Response</span>
                    <span className="text-xs text-text-secondary">
                      {getTimeAgo(inquiry.inquiry.responseAt)}
                    </span>
                  </div>
                  <div className="bg-secondary-50 p-3 rounded-lg">
                    <p className="text-sm text-text-primary">{inquiry.inquiry.response}</p>
                  </div>
                </div>
              )}

              {/* Scheduled Viewing */}
              {inquiry.inquiry.scheduledViewing && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success rounded-lg">
                    <Icon name="Calendar" size={16} className="text-success" />
                    <div>
                      <p className="text-sm font-medium text-success">Viewing Scheduled</p>
                      <p className="text-xs text-success">
                        {new Date(inquiry.inquiry.scheduledViewing).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Link to={`/property-details?id=${inquiry.id}`}>
                  <Button variant="outline" size="sm" iconName="Eye">
                    View Property
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-2">
                  {inquiry.inquiry.status === 'pending' && (
                    <span className="text-xs text-warning flex items-center">
                      <Icon name="Clock" size={12} className="mr-1" />
                      Waiting for response
                    </span>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    iconName="MessageSquare"
                  >
                    Follow Up
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentInquiries;