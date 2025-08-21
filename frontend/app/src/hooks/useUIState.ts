import { useState } from 'react';
import type { RegisteredDevice } from '../services/DeviceService';

export interface ModalState {
  add: boolean;
  edit: { open: boolean; device: RegisteredDevice | null };
  delete: { open: boolean; device: { id: string; name: string } | null };
}

export const useUIState = () => {
  const [modals, setModals] = useState<ModalState>({
    add: false,
    edit: { open: false, device: null },
    delete: { open: false, device: null },
  });

  const [touched, setTouched] = useState<{ [field: string]: boolean }>({});

  // Modal actions
  const openAddModal = () => {
    setModals(prev => ({ ...prev, add: true }));
  };

  const closeAddModal = () => {
    setModals(prev => ({ ...prev, add: false }));
  };

  const openEditModal = (device: RegisteredDevice) => {
    setModals(prev => ({ 
      ...prev, 
      edit: { open: true, device } 
    }));
  };

  const closeEditModal = () => {
    setModals(prev => ({ 
      ...prev, 
      edit: { open: false, device: null } 
    }));
  };

  const openDeleteModal = (deviceId: string, deviceName: string) => {
    setModals(prev => ({ 
      ...prev, 
      delete: { open: true, device: { id: deviceId, name: deviceName } } 
    }));
  };

  const closeDeleteModal = () => {
    setModals(prev => ({ 
      ...prev, 
      delete: { open: false, device: null } 
    }));
  };

  // Form state management
  const markFieldTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFieldTouched = (field: string) => touched[field] || false;

  const resetTouched = () => {
    setTouched({});
  };

  return {
    // Modal state
    modals,
    
    // Modal actions
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    
    // Form state
    touched,
    markFieldTouched,
    isFieldTouched,
    resetTouched,
  };
};