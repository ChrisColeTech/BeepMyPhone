import React from 'react';
import { useToast } from '../hooks/useToast';
import { useDeviceData } from '../hooks/useDeviceData';
import { useDeviceActions } from '../hooks/useDeviceActions';
import { useUIState } from '../hooks/useUIState';
import { useDeviceFilters } from '../hooks/useDeviceFilters';
import { DeviceFilters } from '../components/devices/DeviceFilters';
import { DeviceTable } from '../components/devices/DeviceTable';
import { EmptyDeviceState } from '../components/devices/EmptyDeviceState';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { AddDeviceModal } from '../components/devices/AddDeviceModal';
import { EditDeviceModal } from '../components/devices/EditDeviceModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { NotificationHandling } from '../utils/NotificationHandling';
import { Plus, RefreshCw } from 'lucide-react';

export const Devices: React.FC = () => {
  const toast = useToast();
  
  // Separated concerns using focused hooks
  const { devices, loading, error, refreshDevices } = useDeviceData();
  const { deleteDevice, testNotification, isDeleting, getDeletingId, getTestingId } = useDeviceActions();
  const { modals, openAddModal, closeAddModal, openEditModal, closeEditModal, openDeleteModal, closeDeleteModal } = useUIState();
  const {
    searchQuery,
    statusFilter,
    platformFilter,
    setSearchQuery,
    setStatusFilter,
    setPlatformFilter,
    filteredDevices,
    clearFilters,
  } = useDeviceFilters(devices);

  // Action handlers using separated concerns
  const handleDelete = (id: string, deviceName: string) => {
    openDeleteModal(id, deviceName);
  };

  const confirmDelete = async () => {
    if (!modals.delete.device) return;

    try {
      await deleteDevice(modals.delete.device.id);
      NotificationHandling.deviceOperations.deviceDeleted(modals.delete.device.name, toast);
      refreshDevices(); // Refresh data after deletion
    } catch (err) {
      const errorMessage = NotificationHandling.formatErrorMessage(err);
      NotificationHandling.deviceErrors.deleteFailed(errorMessage, toast);
    } finally {
      closeDeleteModal();
    }
  };

  const handleTestNotification = async (id: string) => {
    try {
      await testNotification(id, 'Test notification from BeepMyPhone');
      NotificationHandling.deviceOperations.testNotificationSent(toast);
    } catch (err) {
      const errorMessage = NotificationHandling.formatErrorMessage(err);
      NotificationHandling.deviceErrors.testNotificationFailed(errorMessage, toast);
    }
  };


  // Loading and error states using focused components
  if (loading) {
    return <LoadingState message="Loading devices..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshDevices} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Connected Devices
          </h1>
          <div className="flex space-x-3">
            <button 
              onClick={refreshDevices}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-border-default rounded-lg hover:bg-interactive-hover transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Device</span>
            </button>
          </div>
        </div>


        {/* Search and Filter Controls */}
        <DeviceFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          platformFilter={platformFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onPlatformFilterChange={setPlatformFilter}
          onClearFilters={clearFilters}
          filteredCount={filteredDevices.length}
          totalCount={devices.length}
        />

        {/* Device Display - using focused components */}
        {filteredDevices.length === 0 ? (
          <EmptyDeviceState 
            totalDevices={devices.length}
            onClearFilters={clearFilters}
          />
        ) : (
          <DeviceTable
            devices={filteredDevices}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onTestNotification={handleTestNotification}
            testingId={getTestingId()}
            deletingId={getDeletingId()}
          />
        )}
      </div>

      {/* Modals using separated UI state management */}
      <AddDeviceModal 
        isOpen={modals.add} 
        onClose={closeAddModal} 
      />

      <EditDeviceModal 
        isOpen={modals.edit.open} 
        device={modals.edit.device}
        onClose={closeEditModal} 
      />

      <ConfirmModal
        isOpen={modals.delete.open}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Device"
        message={`Are you sure you want to delete "${modals.delete.device?.name}"? This action cannot be undone and will remove all notification history for this device.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={modals.delete.device ? isDeleting(modals.delete.device.id) : false}
      />
    </div>
  );
};

export default Devices;