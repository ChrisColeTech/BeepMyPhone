import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Dashboard } from '../pages/Dashboard';
import { Settings } from '../pages/Settings';
import { Devices } from '../pages/Devices';
import { DeviceDetail } from '../pages/DeviceDetail';
import { NotificationHistory } from '../pages/NotificationHistory';
import { NotificationDetail } from '../pages/NotificationDetail';
import { TestNotifications } from '../pages/TestNotifications';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout title="BeepMyPhone" showTitleBar={true}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/notifications" element={<NotificationHistory />} />
          <Route path="/notifications/:id" element={<NotificationDetail />} />
          <Route path="/test" element={<TestNotifications />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};