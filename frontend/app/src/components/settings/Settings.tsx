import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { notificationService } from '../../services/NotificationService';

interface SettingsProps {
  className?: string;
}

export const Settings: React.FC<SettingsProps> = ({ className = '' }) => {
  const [serverUrl, setServerUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setServerUrl(notificationService.getBaseUrl());
  }, []);

  const handleSave = () => {
    const cleanUrl = serverUrl.replace(/\/+$/, ''); // Remove trailing slashes
    notificationService.setBaseUrl(cleanUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setServerUrl(notificationService.getBaseUrl());
    setIsEditing(false);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <Card className={`${className}`}>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">Server Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure the connection to your PC's notification service
        </p>
      </Card.Header>
      
      <Card.Body className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Server URL
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="http://192.168.1.100:5001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={!isValidUrl(serverUrl)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
              {serverUrl && !isValidUrl(serverUrl) && (
                <p className="text-sm text-red-600">
                  Please enter a valid URL (e.g., http://192.168.1.100:5001)
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border">
                {serverUrl}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-3 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How to find your PC's IP:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Windows: Open Command Prompt and run <code className="bg-blue-100 px-1 rounded">ipconfig</code></li>
            <li>• Look for "IPv4 Address" under your network adapter</li>
            <li>• Use format: http://[IP]:5001 (e.g., http://192.168.1.100:5001)</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};