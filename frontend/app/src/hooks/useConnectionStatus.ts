import { useState, useEffect } from 'react';

interface UseConnectionStatusProps {
  isConnected: boolean;
}

export const useConnectionStatus = ({ isConnected }: UseConnectionStatusProps) => {
  const [connectionUptime, setConnectionUptime] = useState<number>(0);
  const [lastConnectedTime, setLastConnectedTime] = useState<Date | null>(null);

  // Track connection status changes
  useEffect(() => {
    if (isConnected && !lastConnectedTime) {
      setLastConnectedTime(new Date());
      setConnectionUptime(0);
    } else if (!isConnected && lastConnectedTime) {
      setLastConnectedTime(null);
      setConnectionUptime(0);
    }
  }, [isConnected, lastConnectedTime]);

  // Update connection uptime
  useEffect(() => {
    if (!isConnected || !lastConnectedTime) return;
    
    const interval = setInterval(() => {
      setConnectionUptime(Date.now() - lastConnectedTime.getTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isConnected, lastConnectedTime]);

  return {
    connectionUptime,
    lastConnectedTime
  };
};
