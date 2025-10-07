// useLocation.js - Custom Hook with Permission API Support
import { useState, useEffect } from 'react';

const useLocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null); // 'granted', 'denied', 'prompt'

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options
  };

  // Check current permission status
  const checkPermissionStatus = async () => {
    if (!navigator.permissions) {
      return null;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);
      
      // Listen for permission changes
      permission.addEventListener('change', () => {
        setPermissionStatus(permission.state);
        
        // If permission was granted after being denied, automatically get location
        if (permission.state === 'granted' && permissionDenied) {
          setPermissionDenied(false);
          getCurrentLocation();
        }
      });
      
      return permission.state;
    } catch (err) {
      console.log('Permission API not supported:', err);
      return null;
    }
  };

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setLoading(false);
        setPermissionDenied(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        
        // Check if error is due to permission denied
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError('Location access denied. Please allow location access to use the map.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location information is unavailable.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out.');
        } else {
          setError(`Error getting location: ${err.message}`);
        }
      },
      defaultOptions
    );
  };

  const retryLocation = async () => {
    // First check the current permission status
    const currentPermission = await checkPermissionStatus();
    
    if (currentPermission === 'denied') {
      // Permission is still denied, can't show browser dialog
      // The modal should guide user to manually enable it
      setError('Location permission is blocked. Please enable it manually in your browser settings.');
      return false;
    } else if (currentPermission === 'granted') {
      // Permission is already granted, just get location
      getCurrentLocation();
      return true;
    } else {
      // Permission is 'prompt' or unknown, try to get location
      getCurrentLocation();
      return true;
    }
  };

  return {
    location,
    loading,
    error,
    permissionDenied,
    permissionStatus,
    getCurrentLocation,
    retryLocation
  };
};

export default useLocation;