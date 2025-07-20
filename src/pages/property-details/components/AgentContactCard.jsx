import React, { useState } from 'react';
import UserAvatar from '../../../components/ui/UserAvatar'; // Assuming UserAvatar is in the same directory
import Icon from '../AppIcon'; // Assuming Icon is in '../AppIcon' as per your index.jsx import

const AgentContactCard = ({ property }) => {
  const [copiedPhone, setCopiedPhone] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPhone(id);
      setTimeout(() => setCopiedPhone(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Helper to safely get agent's first and last name
  // Assuming property.agent_name is a string like "John Doe"
  const getAgentFirstName = (agentName) => agentName?.split(' ')[0] || '';
  const getAgentLastName = (agentName) => agentName?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-4 mb-4">
        <UserAvatar
          firstName={getAgentFirstName(property.agent_name)}
          lastName={getAgentLastName(property.agent_name)}
          size="w-16 h-16"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">{property.agent_name}</h3>
          <p className="text-sm text-text-secondary">Real Estate Agent</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6">
        {/* Phone Number */}
        {property.agent_phone_number && (
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">{property.agent_phone_number}</span>
            </div>
            <button
              onClick={() => copyToClipboard(property.agent_phone_number, property.id)}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded transition-colors"
              title="Copy phone number"
            >
              {copiedPhone === property.id ? (
                <Icon name="Check" size={14} className="text-green-500" />
              ) : (
                <Icon name="Copy" size={14} />
              )}
            </button>
          </div>
        )}

        {/* Email */}
        {property.agent_email && (
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">{property.agent_email}</span>
            </div>
            <button
              onClick={() => window.open(`mailto:${property.agent_email}`, '_blank')}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded transition-colors"
              title="Send email"
            >
              <Icon name="ExternalLink" size={14} />
            </button>
          </div>
        )}

        {/* WhatsApp */}
        {property.agent_whatsapp_number && (
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="MessageSquare" size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">WhatsApp</span>
            </div>
            <button
              onClick={() => window.open(`https://wa.me/${property.agent_whatsapp_number?.replace(/[^\d+]/g, '')}`, '_blank')}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-secondary-100 rounded transition-colors"
              title="Message on WhatsApp"
            >
              <Icon name="ExternalLink" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {property.agent_phone_number && (
          <button
            onClick={() => window.open(`tel:${property.agent_phone_number}`, '_blank')}
            className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
          >
            <Icon name="Phone" size={16} />
            <span>Call Agent</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {property.agent_phone_number && (
            <button
              onClick={() => window.open(`sms:${property.agent_phone_number}`, '_blank')}
              className="flex items-center justify-center space-x-2 bg-accent-100 text-accent-600 py-2 rounded-md hover:bg-accent hover:text-white transition-all duration-200"
            >
              <Icon name="MessageCircle" size={16} />
              <span className="text-sm">Send SMS</span>
            </button>
          )}
          {property.agent_email && (
            <button
              onClick={() => window.open(`mailto:${property.agent_email}`, '_blank')}
              className="flex items-center justify-center space-x-2 bg-secondary-100 text-text-secondary py-2 rounded-md hover:bg-secondary-200 transition-all duration-200"
            >
              <Icon name="Mail" size={16} />
              <span className="text-sm">Email</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentContactCard;