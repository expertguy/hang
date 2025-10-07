import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ApiFunction from '../api/apiFuntions';
import { decryptData } from '../api/encrypted';
import { setCheckInData, setCheckInStatus } from '../../components/redux/appDataSlice';

/**
 * Custom hook to sync check-in data from server across devices
 * FIXED: Properly handles invalid dates and localStorage persistence
 */
const useCheckInSync = () => {
    const dispatch = useDispatch();
    const { post } = ApiFunction();
    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const hasSynced = useRef(false);
    const lastSyncTime = useRef(0);
    const hasRestoredFromLocal = useRef(false);
    const SYNC_INTERVAL = 30000; // Minimum 30 seconds between syncs
    
    // Helper function to safely parse dates
    const parseDate = (dateString) => {
        if (!dateString || dateString === '0000-00-00 00:00:00' || dateString === 'NULL') {
            return null;
        }
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };
    
    // Helper function to safely convert date to ISO string
    const toISOString = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return new Date().toISOString();
        }
        return date.toISOString();
    };
    
    // FIXED: Restore from localStorage FIRST before syncing with server
    useEffect(() => {
        if (hasRestoredFromLocal.current) return;
        
        try {
            const storedCheckInData = localStorage.getItem('checkInData');
            
            if (storedCheckInData) {
                const checkInData = JSON.parse(storedCheckInData);
                const expiryTime = checkInData.expiryTime;
                
                // Check if check-in is still valid
                if (expiryTime && new Date() < new Date(expiryTime)) {
                    
                    // Restore to Redux
                    dispatch(setCheckInStatus(true));
                    dispatch(setCheckInData(checkInData));
                    
                    hasRestoredFromLocal.current = true;
                    return;
                } else {
                    // Clear expired data
                    localStorage.removeItem('checkInData');
                    localStorage.removeItem('checkInLat');
                    localStorage.removeItem('checkInLong');
                    localStorage.removeItem('checkInType');
                    localStorage.removeItem('checkInPlaceName');
                }
            }
            
            hasRestoredFromLocal.current = true;
        } catch (error) {
            console.error('❌ Error restoring from localStorage:', error);
            hasRestoredFromLocal.current = true;
        }
    }, [dispatch]);
    
    const syncCheckInFromServer = useCallback(async (forceSync = false) => {
        // FIXED: Wait for localStorage restoration first
        if (!hasRestoredFromLocal.current) {
            return;
        }
        
        // Check if enough time has passed since last sync (unless forced)
        const now = Date.now();
        if (!forceSync && (now - lastSyncTime.current) < SYNC_INTERVAL) {
            return;
        }

        // Prevent multiple simultaneous calls
        if (!forceSync && hasSynced.current) {
            return;
        }

        if (!encryptedToken) {
            return;
        }

        hasSynced.current = true;
        lastSyncTime.current = now;

        try {
            const userToken = decryptData(encryptedToken);
            
            const data = new FormData();
            data.append('type', 'get_data');
            data.append('table_name', 'check_in');
            data.append('user_id', userToken);

            
            const response = await post('', data);
            
            if (response?.data && response.data.length > 0) {
                const lastCheckIn = response.data[0];
                
                
                // Check if user is still checked in
                if (lastCheckIn.checkout_time === "0000-00-00 00:00:00" || 
                    lastCheckIn.checkout_time === null || 
                    lastCheckIn.checkout_time === "NULL") {
                    
                    
                    // FIXED: Safely parse check-in time with fallback
                    let checkInTime = parseDate(lastCheckIn.created_at) || 
                                     parseDate(lastCheckIn.checkin_time) || 
                                     parseDate(lastCheckIn.timestamp);
                    
                    // If all dates are invalid, use current time as fallback
                    if (!checkInTime) {
                        console.warn('⚠️ Invalid check-in time from server, using current time');
                        checkInTime = new Date();
                    }
                    
                    const durationMinutes = parseInt(lastCheckIn.duration) || 1440; // Default 24 hours
                    const expiryTime = new Date(checkInTime.getTime() + (durationMinutes * 60 * 1000));
                    const now = new Date();
                    
                    // Check if check-in has expired
                    if (now > expiryTime) {
                        
                        // FIXED: Only clear if localStorage doesn't have a valid check-in
                        const localData = localStorage.getItem('checkInData');
                        if (!localData) {
                            dispatch(setCheckInStatus(false));
                            dispatch(setCheckInData({}));
                        }
                        return;
                    }
                    
                    // FIXED: Compare server data with localStorage
                    const localData = localStorage.getItem('checkInData');
                    if (localData) {
                        const parsedLocal = JSON.parse(localData);
                        
                        // If local data has same checkInId and is still valid, don't overwrite
                        if (parsedLocal.checkInId === lastCheckIn.id) {
                            return;
                        }
                    }
                    
                    // Parse visibility data
                    let visibility = [];
                    try {
                        visibility = JSON.parse(lastCheckIn.visibility);
                    } catch (e) {
                        console.warn('Failed to parse visibility data:', e);
                        visibility = ["everyone"];
                    }
                    
                    // Reconstruct check-in data with safe date handling
                    const checkInData = {
                        checkInType: lastCheckIn.check_type || 'city',
                        duration: durationMinutes,
                        checkInId: lastCheckIn.id,
                        status_text: lastCheckIn.status_text || "",
                        location: {
                            id: lastCheckIn.place_id || 'current',
                            place_id: lastCheckIn.place_id || null,
                            name: lastCheckIn.place_name || 'Current Location',
                            fullName: lastCheckIn.address || 'Current Location',
                            type: lastCheckIn.check_type || 'city',
                            lat: parseFloat(lastCheckIn.lat) || 0,
                            lon: parseFloat(lastCheckIn.lng) || 0,
                            country: '',
                            state: '',
                            city: lastCheckIn.check_type === 'city' ? lastCheckIn.place_name : ''
                        },
                        userLocation: {
                            latitude: parseFloat(lastCheckIn.lat) || 0,
                            longitude: parseFloat(lastCheckIn.lng) || 0
                        },
                        place_id: lastCheckIn.place_id || null,
                        place_name: lastCheckIn.place_name || null,
                        checkInTime: toISOString(checkInTime),
                        expiryTime: toISOString(expiryTime),
                        visibility: visibility
                    };
                    
                    
                    localStorage.setItem('checkInData', JSON.stringify(checkInData));
                    
                    if (lastCheckIn.place_id && lastCheckIn.place_id !== 'current') {
                        localStorage.setItem('checkInLong', lastCheckIn.lng);
                        localStorage.setItem('checkInLat', lastCheckIn.lat);
                        localStorage.setItem('checkInType', lastCheckIn.check_type);
                        localStorage.setItem('checkInPlaceName', lastCheckIn.place_name || '');
                    }
                    
                    dispatch(setCheckInStatus(true));
                    dispatch(setCheckInData(checkInData));
                    
                } else {
                    
                    // User has checked out - IMMEDIATELY clear all check-in data
                    
                    localStorage.removeItem('checkInData');
                    localStorage.removeItem('checkInLat');
                    localStorage.removeItem('checkInLong');
                    localStorage.removeItem('checkInType');
                    localStorage.removeItem('checkInPlaceName');
                    
                    dispatch(setCheckInStatus(false));
                    dispatch(setCheckInData({}));
                }
            } else {
                
                // FIXED: Keep valid localStorage data
                const localData = localStorage.getItem('checkInData');
                if (localData) {
                    const parsedLocal = JSON.parse(localData);
                    const localExpiry = new Date(parsedLocal.expiryTime);
                    
                    if (new Date() < localExpiry) {
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error syncing check-in from server:', error);
            hasSynced.current = false;
        }
    }, [encryptedToken, post, dispatch]);

    // FIXED: Only sync from server AFTER localStorage has been restored
    useEffect(() => {
        if (encryptedToken && hasRestoredFromLocal.current) {
            // Delay initial sync to allow component to mount
            const timeout = setTimeout(() => {
                syncCheckInFromServer(true);
            }, 1000);
            
            return () => clearTimeout(timeout);
        }
    }, [encryptedToken, syncCheckInFromServer]);

    // Sync when app comes back to focus
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && encryptedToken && hasRestoredFromLocal.current) {
                // Force sync to immediately check server status
                hasSynced.current = false;
                syncCheckInFromServer(true);
            }
        };

        const handleFocus = () => {
            if (encryptedToken && hasRestoredFromLocal.current) {
                // Force sync to immediately check server status
                hasSynced.current = false;
                syncCheckInFromServer(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [encryptedToken, syncCheckInFromServer]);

    // Periodic sync every 30 seconds when app is active (reduced from 2 minutes for faster checkout detection)
    useEffect(() => {
        if (!encryptedToken || !hasRestoredFromLocal.current) return;

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                hasSynced.current = false; // Reset to allow sync
                syncCheckInFromServer(true);
            }
        }, 30000); // 30 seconds for faster checkout detection

        return () => clearInterval(intervalId);
    }, [encryptedToken, syncCheckInFromServer]);

    return { syncCheckInFromServer };
};

export default useCheckInSync;