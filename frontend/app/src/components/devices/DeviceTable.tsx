import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Pencil, Trash2, Send, RefreshCw, ExternalLink } from 'lucide-react';
import type { RegisteredDevice } from '../../services/DeviceService';

interface DeviceTableProps {
  devices: RegisteredDevice[];
  onEdit: (device: RegisteredDevice) => void;
  onDelete: (id: string, name: string) => void;
  onTestNotification: (id: string) => void;
  testingId: string | null;
  deletingId: string | null;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onEdit,
  onDelete,
  onTestNotification,
  testingId,
  deletingId,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (isConnected: boolean) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isConnected 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }`}>
      {isConnected ? 'Connected' : 'Offline'}
    </span>
  );

  return (
    <div className="bg-background-card border border-border-default rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Last Seen
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {devices.map((device) => (
              <tr key={device.deviceId} className="hover:bg-interactive-hover">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 text-text-muted mr-3" />
                    <button
                      onClick={() => navigate(`/devices/${device.deviceId}`)}
                      className="text-sm font-medium text-brand-primary hover:text-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <span>{device.deviceName}</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-background-elevated rounded">
                    {device.deviceType.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(device.isActive)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {new Date(device.lastSeen).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onTestNotification(device.deviceId)}
                      disabled={testingId === device.deviceId || !device.isActive}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send test notification"
                    >
                      {testingId === device.deviceId ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                    <button 
                      onClick={() => onEdit(device)}
                      className="p-2 text-text-muted hover:bg-interactive-hover rounded-lg transition-colors"
                      title="Edit device"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(device.deviceId, device.deviceName)}
                      disabled={deletingId === device.deviceId}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete device"
                    >
                      {deletingId === device.deviceId ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};