/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { RiEqualizer2Line, RiMapPinLine, RiNotification3Line } from 'react-icons/ri';
import NearbyDrawer from './component/home/nearbyDrawer';
import FilterDrawer from './component/home/filterDrawer';
import CheckIn from './component/home/checkIn';
import CheckOut from './component/home/checkOut';
import CheckOutComplete from './component/home/checkOutComplete';
import FooterHome from './footerHome';
import Splash from './auth/splash';
import LocationPermissionModal from './LocationPermissionModal';
import useLocation from '../../utils/location/location';
import ApiFunction from '../../utils/api/apiFuntions';
import { useSelector, useDispatch } from 'react-redux';
import { decryptData } from '../../utils/api/encrypted';
import { setCheckInStatus, setCheckInData } from '../redux/appDataSlice';
import VisibilityDrawer from './component/home/visibilityDrawer';
import { RiArrowRightSLine, RiCloseLine } from '@remixicon/react';
import { Offcanvas } from 'react-bootstrap';
import CheckInManage from './component/home/checkInManage';
import { Link } from 'react-router-dom';

// Utility functions for check-in management
const isCheckInActive = () => {
  try {
    const checkInData = JSON.parse(localStorage.getItem('checkInData') || '{}');
    const checkInTime = checkInData.checkInTime;
    const duration = checkInData.duration;

    if (!checkInTime || !duration) return false;

    const checkInDate = new Date(checkInTime);
    const expiryDate = new Date(checkInDate.getTime() + (duration * 60 * 1000));
    const now = new Date();

    return now <= expiryDate;
  } catch (error) {
    console.error('Error checking check-in status:', error);
    return false;
  }
};

const clearExpiredCheckIn = () => {
  if (!isCheckInActive()) {
    localStorage.removeItem('checkInLong');
    localStorage.removeItem('checkInLat');
    localStorage.removeItem('checkInType');
    localStorage.removeItem('checkInPlaceName');
    localStorage.removeItem('checkInData');
    return true;
  }
  return false;
};

// Stacked Users Modal Component
const StackedUsersModal = ({ show, users, onClose, onUserSelect }) => {
  if (!show) return null;

  return (
    <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={show} placement='bottom' onHide={onClose} className="offcanvas-bottom offcanvasBG">
      <Offcanvas.Header className='relative py-4'>
        <h1 className='britti fs_18 mb-0 text-center w-full'>All Hangers ({users?.length})</h1>
        <RiCloseLine onClick={onClose} className='w-[24px] h-[24px] absolute right-5' />
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className='flex flex-col items-center h-100 w-full px-[5px]'>
          {users?.map((user, index) => (
            <div
              key={user.id || index}
              onClick={() => !user.isCurrentUser && onUserSelect(user)}
              className={`profileCard mt-2 flex items-center gap-3 w-full ${!user.isCurrentUser ? 'cursor-pointer' : ''}`}>
              <div className='profile_Image'>
                <img src={user?.image} className='bg_primary' alt="" />
              </div>
              <div>
                <h2 className='fs_16 britti_medium mb-1'>
                  {user?.name} {user.isCurrentUser && '(You)'}
                </h2>
                <span className='fs_14 txt_grey'>{user?.designation} - {user?.company}.</span>
              </div>
              {!user.isCurrentUser && <RiArrowRightSLine className='ms-auto w-[20px] h-[20px]' />}
            </div>
          ))}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const {
    location,
    loading: locationLoading,
    error: locationError,
    permissionDenied,
    permissionStatus,
    getCurrentLocation,
    retryLocation
  } = useLocation();

  const [users, setUsers] = useState(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [map, setMap] = useState(null);
  const [userIcons, setUserIcons] = useState({});
  const [currentUserIcon, setCurrentUserIcon] = useState(null);
  const [filterData, setFilterData] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('Getting location...');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [useDefaultLocation, setUseDefaultLocation] = useState(false);

  // Navigation states
  const [initialNavigationComplete, setInitialNavigationComplete] = useState(false);
  const [isNavigatingToCheckIn, setIsNavigatingToCheckIn] = useState(false);
  const [isAtCheckInLocation, setIsAtCheckInLocation] = useState(false);
  const [showUserAtCurrentLocation, setShowUserAtCurrentLocation] = useState(false);

  // Stacked users states
  const [groupedUsers, setGroupedUsers] = useState([]);
  const [stackedUsersModal, setStackedUsersModal] = useState({
    show: false,
    users: []
  });

  const UserDataEncrypted = useSelector(state => state?.appData?.userData);
  const currentUserData = decryptData(UserDataEncrypted);
  const reduxCheckIn = useSelector(state => state?.appData?.checkInData);
  const [center, setCenter] = useState({
    lat: 20.673,
    lng: -103.344
  });

  // Drawer states
  const [peopleDrawer, setPeopleDrawer] = useState(false);
  const handlePeopleClose = () => setPeopleDrawer(false);

  const [filterDrawer, setFilterDrawer] = useState(false);
  const handleFilterClose = () => setFilterDrawer(false);
  const handleFilterShow = () => setFilterDrawer(true);

  const [checkInDrawer, setCheckInDrawer] = useState(false);
  const [isReplacingCheckIn, setIsReplacingCheckIn] = useState(false);
  const handleCheckInClose = () => {
    setCheckInDrawer(false);
    setIsReplacingCheckIn(false);
  };
  const handleCheckInShow = (replacing = false) => {
    setIsReplacingCheckIn(replacing);
    setCheckInDrawer(true);
  };

  const [checkOutDrawer, setCheckOutDrawer] = useState(false);
  const handleCheckOutClose = () => setCheckOutDrawer(false);
  const handleCheckOutShow = () => setCheckOutDrawer(true);

  const [checkInStatusDrawer, setCheckInStatusDrawer] = useState(false);
  const handleCheckInStatusClose = () => setCheckInStatusDrawer(false);
  const handleCheckInStatusShow = () => setCheckInStatusDrawer(true);

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const handleCompleteCheckoutClose = () => setCheckoutComplete(false);
  const handleCompleteCheckOutShow = () => setCheckoutComplete(true);

  const encryptedToken = useSelector(state => state?.appData?.userToken);
  const userToken = decryptData(encryptedToken);

  // Load the Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAP-8oI9lGS6a4iXlCdSD7bZDyz_D-FGAs',
  });

  // Get current location only once on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const [showNotification, setShowNotification] = useState(0);
  const { post } = ApiFunction();
  
  // Stable reference for post function
  const postRef = useRef(post);
  useEffect(() => {
    postRef.current = post;
  }, [post]);

  // ✅ Fixed Notification API
  useEffect(() => {
    if (!userToken) return;

    const getNotificationStatus = async () => {
      const notificationData = new FormData();
      notificationData.append('type', 'get_data');
      notificationData.append('user_id', userToken);
      notificationData.append('table_name', 'notifications');

      try {
        const res = await post('', notificationData);
        if (res?.data && res?.data[0]) {
          setShowNotification(Number(res.data[0].has_unseen));
        }
      } catch (err) {
        console.log("Notification error:", err);
      }
    }

    getNotificationStatus();
    
    const interval = setInterval(() => {
      getNotificationStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userToken]);

  // Handle location permission denied
  useEffect(() => {
    if (permissionDenied && !useDefaultLocation) {
      setShowLocationModal(true);
    }
  }, [permissionDenied, useDefaultLocation]);

  // MAIN LOGIC: Handle initial navigation on login/app load
  useEffect(() => {
    const handleInitialNavigation = async () => {
      if (!userToken || !isLoaded || initialNavigationComplete) return;

      const checkInLat = localStorage.getItem('checkInLat');
      const checkInLong = localStorage.getItem('checkInLong');
      const storedCheckInData = localStorage.getItem('checkInData');

      let isActiveCheckIn = false;
      if (storedCheckInData) {
        try {
          const checkInData = JSON.parse(storedCheckInData);
          const checkInTime = checkInData.checkInTime;
          const duration = checkInData.duration;

          if (checkInTime && duration) {
            const checkInDate = new Date(checkInTime);
            const expiryDate = new Date(checkInDate.getTime() + (duration * 60 * 1000));
            const now = new Date();
            isActiveCheckIn = now <= expiryDate;

            if (!isActiveCheckIn) {
              localStorage.removeItem('checkInLong');
              localStorage.removeItem('checkInLat');
              localStorage.removeItem('checkInType');
              localStorage.removeItem('checkInPlaceName');
              localStorage.removeItem('checkInData');
              dispatch(setCheckInStatus(false));
              dispatch(setCheckInData(null));
            } else {
              dispatch(setCheckInStatus(true));
              dispatch(setCheckInData(checkInData));
            }
          }
        } catch (error) {
          console.error('Error parsing check-in data:', error);
          clearExpiredCheckIn();
        }
      }

      if (isActiveCheckIn && checkInLat && checkInLong) {
        const checkInLatitude = parseFloat(checkInLat);
        const checkInLongitude = parseFloat(checkInLong);
        setLatitude(checkInLatitude);
        setLongitude(checkInLongitude);

        const checkInCenter = {
          lat: checkInLatitude,
          lng: checkInLongitude
        };

        setCenter(checkInCenter);
        setIsAtCheckInLocation(true);
        setShowUserAtCurrentLocation(false);
        getAddressFromCoordinates(checkInLatitude, checkInLongitude);

        if (map) {
          setIsNavigatingToCheckIn(true);
          map.panTo(checkInCenter);
          map.setZoom(16);

          setTimeout(() => {
            setIsNavigatingToCheckIn(false);
          }, 1000);
        }
      } else {
        if (location?.latitude && location?.longitude) {
          setLatitude(location.latitude);
          setLongitude(location.longitude);

          const gpsCenter = {
            lat: location.latitude,
            lng: location.longitude
          };

          setCenter(gpsCenter);
          setIsAtCheckInLocation(false);
          setShowUserAtCurrentLocation(false);
          getAddressFromCoordinates(location.latitude, location.longitude);

          if (map) {
            map.panTo(gpsCenter);
            map.setZoom(14);
          }
        }
      }

      setInitialNavigationComplete(true);
    };

    const timeoutId = setTimeout(handleInitialNavigation, 500);
    return () => clearTimeout(timeoutId);
  }, [userToken, isLoaded, map, location, initialNavigationComplete, dispatch]);

  // Handle check-in status changes
  const checkInStatus = useSelector(state => state.appData?.checkInStatus);

  useEffect(() => {
    if (!initialNavigationComplete) return;

    const checkInLat = localStorage.getItem('checkInLat');
    const checkInLong = localStorage.getItem('checkInLong');

    if (checkInStatus && checkInLat && checkInLong) {
      const checkInLatitude = parseFloat(checkInLat);
      const checkInLongitude = parseFloat(checkInLong);

      setLatitude(checkInLatitude);
      setLongitude(checkInLongitude);
      setShowUserAtCurrentLocation(false);

      const checkInCenter = {
        lat: checkInLatitude,
        lng: checkInLongitude
      };

      if (map) {
        setIsNavigatingToCheckIn(true);
        map.panTo(checkInCenter);
        map.setZoom(16);

        setTimeout(() => {
          setIsNavigatingToCheckIn(false);
        }, 1000);
      } else {
        setCenter(checkInCenter);
      }

      setIsAtCheckInLocation(true);
      getAddressFromCoordinates(checkInLatitude, checkInLongitude);
    } else if (location?.latitude && location?.longitude) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);

      const gpsCenter = {
        lat: location.latitude,
        lng: location.longitude
      };

      if (map && !checkInStatus) {
        map.panTo(gpsCenter);
        map.setZoom(14);
      } else if (!checkInStatus) {
        setCenter(gpsCenter);
      }

      setIsAtCheckInLocation(false);
      if (!checkInStatus) {
        getAddressFromCoordinates(location.latitude, location.longitude);
      }
    }
  }, [checkInStatus, location, map, initialNavigationComplete]);

  // Auto-clear expired check-ins
  useEffect(() => {
    const checkExpiry = setInterval(() => {
      if (clearExpiredCheckIn()) {
        dispatch(setCheckInStatus(false));
        dispatch(setCheckInData(null));
      }
    }, 60000);

    return () => clearInterval(checkExpiry);
  }, [dispatch]);

  // Navigation functions
  const navigateToCurrentLocation = useCallback(() => {
    if (!map || !location?.latitude || !location?.longitude) return;

    const gpsCenter = {
      lat: location.latitude,
      lng: location.longitude
    };

    map.panTo(gpsCenter);
    map.setZoom(14);

    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setCenter(gpsCenter);
    setShowUserAtCurrentLocation(true);
    setIsAtCheckInLocation(false);
    getAddressFromCoordinates(location.latitude, location.longitude);
  }, [map, location]);

  const navigateToCheckInFromTimer = useCallback(() => {
    const checkInLat = localStorage.getItem('checkInLat');
    const checkInLong = localStorage.getItem('checkInLong');

    if (checkInStatus && checkInLat && checkInLong && map) {
      const checkInCenter = {
        lat: parseFloat(checkInLat),
        lng: parseFloat(checkInLong)
      };

      setIsNavigatingToCheckIn(true);
      map.panTo(checkInCenter);
      map.setZoom(16);

      setShowUserAtCurrentLocation(false);
      setLatitude(parseFloat(checkInLat));
      setLongitude(parseFloat(checkInLong));
      getAddressFromCoordinates(parseFloat(checkInLat), parseFloat(checkInLong));

      setTimeout(() => {
        setIsNavigatingToCheckIn(false);
      }, 1000);
    }
  }, [checkInStatus, map]);

  // Calculate map center
  const mapCenter = useMemo(() => {
    const checkInLat = localStorage.getItem('checkInLat');
    const checkInLong = localStorage.getItem('checkInLong');

    if (checkInStatus && checkInLat && checkInLong && !showUserAtCurrentLocation) {
      return {
        lat: parseFloat(checkInLat),
        lng: parseFloat(checkInLong)
      };
    }

    return center;
  }, [checkInStatus, center, showUserAtCurrentLocation]);

  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    return !isNaN(latitude) && !isNaN(longitude) &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180;
  };

  // GROUP USERS BY LOCATION - WITH current user (agar woh checked in hai)
  const groupUsersByLocation = useCallback((usersList) => {
    if (!usersList || usersList.length === 0) return [];

    // Check if current user is checked in
    const checkInLat = localStorage.getItem('checkInLat');
    const checkInLong = localStorage.getItem('checkInLong');
    const storedCheckInStatus = localStorage.getItem('checkInData');
    let isUserCheckedIn = false;

    if (storedCheckInStatus && checkInLat && checkInLong) {
      try {
        const checkInData = JSON.parse(storedCheckInStatus);
        const checkInTime = checkInData.checkInTime;
        const duration = checkInData.duration;

        if (checkInTime && duration) {
          const checkInDate = new Date(checkInTime);
          const expiryDate = new Date(checkInDate.getTime() + (duration * 60 * 1000));
          const now = new Date();
          isUserCheckedIn = now <= expiryDate;
        }
      } catch (error) {
        console.error('Error parsing check-in data:', error);
      }
    }

    // All users list - including current user if checked in
    let allUsers = [...usersList];

    // Agar current user checked in hai, to usko list mein add karo
    if (isUserCheckedIn && currentUserData) {
      allUsers.push({
        id: currentUserData.id || 'current-user',
        name: currentUserData.name || 'You',
        image: currentUserData.image,
        designation: currentUserData.designation,
        company: currentUserData.company,
        isCurrentUser: true,
        loc: {
          lat: checkInLat,
          lng: checkInLong
        }
      });
    }

    const groups = [];
    const processed = new Set();

    allUsers.forEach((user, index) => {
      if (processed.has(index)) return;

      const userLat = parseFloat(user?.loc?.lat);
      const userLng = parseFloat(user?.loc?.lng);

      if (!isValidCoordinate(userLat, userLng)) return;

      const nearbyUsers = allUsers.filter((otherUser, otherIndex) => {
        if (processed.has(otherIndex)) return false;

        const otherLat = parseFloat(otherUser?.loc?.lat);
        const otherLng = parseFloat(otherUser?.loc?.lng);

        if (!isValidCoordinate(otherLat, otherLng)) return false;

        const distance = Math.sqrt(
          Math.pow(userLat - otherLat, 2) + Math.pow(userLng - otherLng, 2)
        );

        return distance < 0.0005;
      });

      nearbyUsers.forEach((_, idx) => {
        const originalIndex = allUsers.findIndex(u => u.id === nearbyUsers[idx].id);
        processed.add(originalIndex);
      });

      groups.push({
        id: `group-${user.id}`,
        lat: userLat,
        lng: userLng,
        users: nearbyUsers,
        count: nearbyUsers.length
      });
    });

    return groups;
  }, [currentUserData]);

  // Default user icon
  const createDefaultUserIcon = useCallback(() => {
    const size = 40;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#4285F4" />
  <path d="M${size / 2} ${size / 2 - 6} 
    a 6 6 0 0 1 6 6 
    a 6 6 0 0 1 -6 6 
    a 6 6 0 0 1 -6 -6 
    a 6 6 0 0 1 6 -6 z 
    M${size / 2} ${size / 2 + 3} 
    a 9 9 0 0 1 9 9 
    v 6 
    a 1 1 0 0 1 -1 1 
    h -16 
    a 1 1 0 0 1 -1 -1 
    v -6 
    a 9 9 0 0 1 9 -9 z" 
    fill="white" />
</svg>`;
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }, []);

  // STACKED MARKER ICON
  const createStackedMarkerIcon = useCallback(async (users) => {
    try {
      const maxDisplay = 3;
      const displayUsers = users.slice(0, maxDisplay);
      const remainingCount = users.length - maxDisplay;

      const imagePromises = displayUsers.map(async user => {
        if (user?.image) {
          try {
            return await convertImageToDataURL(user.image);
          } catch (error) {
            return createDefaultUserIcon();
          }
        } else {
          return createDefaultUserIcon();
        }
      });

      const imageDataUrls = await Promise.all(imagePromises);

      const avatarSize = 40;
      const overlapOffset = 20;
      const countBubbleWidth = remainingCount > 0 ? 40 : 0;
      const totalWidth = avatarSize + (displayUsers.length - 1) * overlapOffset + countBubbleWidth;
      const height = avatarSize + 4;
      const padding = 2;
      const pillWidth = totalWidth + padding * 4;
      const pillHeight = height + padding * 2;

      let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${pillWidth}" height="${pillHeight}">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.2"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect x="0" y="0" width="${pillWidth}" height="${pillHeight}" 
        rx="${pillHeight / 2}" ry="${pillHeight / 2}" 
        fill="white" stroke="#E5E5E5" stroke-width="1" 
        filter="url(#shadow)" />
`;

      [...displayUsers].reverse().forEach((user, reverseIndex) => {
        const index = displayUsers.length - 1 - reverseIndex;
        const imageDataUrl = imageDataUrls[index];
        const x = index * overlapOffset;
        
        svg += `
  <g transform="translate(${x + padding + 2}, ${padding})">
    <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2 + 1}" fill="white" />
    <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" fill="#83CAE1" />
    <clipPath id="clip-${index}">
      <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" />
    </clipPath>
    <image href="${imageDataUrl}" width="${avatarSize}" height="${avatarSize}" 
           clip-path="url(#clip-${index})" preserveAspectRatio="xMidYMid slice" />
  </g>
`;
      });

      if (remainingCount > 0) {
        const x = displayUsers.length * overlapOffset;
        const bubbleRadius = avatarSize / 2;
        
        svg += `
  <g transform="translate(${x + padding + 2}, ${padding})">
    <circle cx="${bubbleRadius}" cy="${bubbleRadius}" r="${bubbleRadius + 1}" fill="white" />
    <circle cx="${bubbleRadius}" cy="${bubbleRadius}" r="${bubbleRadius}" fill="#F2F4F7" />
    <text x="${bubbleRadius}" y="${bubbleRadius + 6}" 
          text-anchor="middle" font-family="Arial, sans-serif" 
          font-size="14" font-weight="bold" fill="#2D2F30">
      +${remainingCount}
    </text>
  </g>
`;
      }

      svg += `</svg>`;

      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    } catch (error) {
      console.error('Error creating stacked marker:', error);
      return null;
    }
  }, [createDefaultUserIcon]);

  // Group users - FIXED to prevent infinite updates
  useEffect(() => {
    if (users && users.length > 0) {
      const grouped = groupUsersByLocation(users);
      setGroupedUsers(prevGrouped => {
        const prevString = JSON.stringify(prevGrouped);
        const newString = JSON.stringify(grouped);
        // Only update if groups actually changed
        if (prevString !== newString) {
          return grouped;
        }
        return prevGrouped;
      });
    } else {
      setGroupedUsers([]);
    }
  }, [users]);

  // Load icons for grouped users - FIXED INFINITE LOOP
  useEffect(() => {
    let isMounted = true;

    const loadGroupedIcons = async () => {
      if (!groupedUsers || groupedUsers.length === 0) {
        if (isMounted) {
          setUserIcons({});
        }
        return;
      }

      const icons = {};

      for (const group of groupedUsers) {
        if (!isMounted) break;
        
        try {
          // Use all users in the group (including current user if present)
          const stackedIcon = await createStackedMarkerIcon(group.users);
          if (stackedIcon && isMounted) {
            icons[group.id] = stackedIcon;
          }
        } catch (error) {
          console.error(`Error loading icon for group ${group.id}:`, error);
        }
      }

      if (isMounted) {
        setUserIcons(prevIcons => {
          const prevString = JSON.stringify(prevIcons);
          const newString = JSON.stringify(icons);
          // Only update if icons actually changed
          if (prevString !== newString) {
            return icons;
          }
          return prevIcons;
        });
      }
    };

    loadGroupedIcons();

    return () => {
      isMounted = false;
    };
  }, [groupedUsers.length, createStackedMarkerIcon]);

  // Load current user icon
  useEffect(() => {
    const loadCurrentUserIcon = async () => {
      if (currentUserData?.image) {
        try {
          const borderedIcon = await createMarkerWithBorder(currentUserData.image);
          setCurrentUserIcon(borderedIcon);
        } catch (error) {
          console.error('Error loading current user icon:', error);
          setCurrentUserIcon(null);
        }
      } else {
        setCurrentUserIcon(null);
      }
    };

    loadCurrentUserIcon();
  }, [currentUserData?.image]);

  // Handle stacked marker click
  const handleStackedMarkerClick = useCallback((group) => {
    if (group.count === 1) {
      setSelectedUser(group.users[0]);
      setPeopleDrawer(true);
    } else {
      setStackedUsersModal({
        show: true,
        users: group.users
      });
    }
  }, []);

  // User select from modal
  const handleUserSelectFromModal = useCallback((user) => {
    setStackedUsersModal({ show: false, users: [] });
    setSelectedUser(user);
    setPeopleDrawer(true);
  }, []);

  // Close modal
  const handleCloseStackedModal = useCallback(() => {
    setStackedUsersModal({ show: false, users: [] });
  }, []);

  // Get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setCurrentAddress(address);
        } else {
          setCurrentAddress(`${lat?.toFixed(4)}, ${lng?.toFixed(4)}`);
        }
      });
    } catch (error) {
      console.error('Error getting address:', error);
      setCurrentAddress(`${lat?.toFixed(4)}, ${lng?.toFixed(4)}`);
    }
  };

  // Handle location retry
  const handleLocationRetry = async () => {
    const success = await retryLocation();
    if (!success && permissionStatus === 'denied') {
      // Permission blocked
    }
  };

  useEffect(() => {
    if (permissionStatus === 'granted' && showLocationModal) {
      setShowLocationModal(false);
      getCurrentLocation();
    }
  }, [permissionStatus, showLocationModal, getCurrentLocation]);

  // Handle using app without location
  const handleUseWithoutLocation = () => {
    setShowLocationModal(false);
    setUseDefaultLocation(true);
    setCurrentAddress('Default Location (Enable location for better experience)');
  };

  // Static container style
  const containerStyle = {
    width: '100%',
    height: 'calc(var(--vh, 1vh) * 100)'
  };

  const intervalRef = useRef(null);

  // API call function - use postRef for stable reference
  const getMapUsers = useCallback(async () => {
    if (!userToken) return;

    setIsUsersLoading(true);

    const data = new FormData();
    data.append('type', 'get_map_users');
    data.append('user_id', userToken);

    if (filterData && Object.keys(filterData).length > 0) {
      if (filterData.gender) {
        data.append('gender', filterData.gender);
      }
      if (filterData.interests && filterData.interests.length > 0) {
        data.append('interests', JSON.stringify(filterData.interests));
      }
      if (filterData.languages && filterData.languages.length > 0) {
        const languageNames = filterData.languages.map(lang => lang.name);
        data.append('languages', JSON.stringify(languageNames));
      }
    }

    try {
      const res = await Promise.race([
        postRef.current('', data),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), 10000)
        )
      ]);

      if (res?.result) {
        setUsers(prevUsers => {
          const newUsers = res.data;
          if (JSON.stringify(prevUsers) !== JSON.stringify(newUsers)) {
            return newUsers;
          }
          return prevUsers;
        });
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.log("Error in mapUsers API =>", err, 'at', new Date().toLocaleTimeString());
    } finally {
      setIsUsersLoading(false);
    }
  }, [userToken, filterData]);

  // Interval management
  useEffect(() => {
    if (!userToken) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    getMapUsers();

    intervalRef.current = setInterval(() => {
      getMapUsers();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userToken, filterData, getMapUsers]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // When filterData changes, call API immediately
  useEffect(() => {
    if (userToken && filterData !== null) {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Call API immediately
      getMapUsers();
      
      // Restart interval
      intervalRef.current = setInterval(() => {
        getMapUsers();
      }, 30000);
    }
  }, [filterData, userToken, getMapUsers]);

  // Update user location when lat/lng changes
  useEffect(() => {
    const updateUserLocation = async () => {
      if (!latitude || !longitude || !userToken || useDefaultLocation) return;

      const data = new FormData();
      data.append('type', 'add_data');
      data.append('user_id', userToken);
      data.append('table_name', 'user_locations');
      data.append('lat', latitude);
      data.append('lng', longitude);

      try {
        await postRef.current('', data);
      } catch (err) {
        console.log("Error updating location =>", err);
      }
    };

    const timeoutId = setTimeout(() => {
      if (latitude && longitude && !useDefaultLocation) {
        updateUserLocation();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [latitude, longitude, userToken, useDefaultLocation]);

  // Helper functions for markers
  const convertImageToDataURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      const timeout = setTimeout(() => {
        console.error('Image load timeout for:', url);
        reject(new Error('Image load timeout'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = (error) => {
        console.error('Image failed to load:', url, error);
        clearTimeout(timeout);
        reject(error);
      };

      img.src = url;
    });
  };

  const createMarkerWithBorder = async (imageUrl) => {
    try {
      const imageDataUrl = await convertImageToDataURL(imageUrl);
      const avatarSize = 44;
      const borderSize = 2;
      const totalSize = avatarSize + borderSize * 2;

      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}">
  <defs>
    <clipPath id="avatarClip">
      <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" />
    </clipPath>
  </defs>
  <!-- White border circle -->
  <circle cx="${totalSize / 2}" cy="${totalSize / 2}" r="${totalSize / 2}" fill="white" stroke="#E5E5E5" stroke-width="1" />
  <!-- User image -->
  <g transform="translate(${borderSize}, ${borderSize})">
    <circle cx="${avatarSize / 2}" cy="${avatarSize / 2}" r="${avatarSize / 2}" fill="#83CAE1" />
    <image href="${imageDataUrl}" x="0" y="0" width="${avatarSize}" height="${avatarSize}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />
  </g>
</svg>`;

      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  };

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Show loading state while the map is loading
  if (!isLoaded) {
    return <Splash />;
  }

  return (
    <>
      <LocationPermissionModal
        show={showLocationModal}
        loading={locationLoading}
        permissionStatus={permissionStatus}
        error={locationError}
        onRetry={handleLocationRetry}
        onCancel={handleUseWithoutLocation}
      />

      <StackedUsersModal
        show={stackedUsersModal.show}
        users={stackedUsersModal.users}
        onClose={handleCloseStackedModal}
        onUserSelect={handleUserSelectFromModal}
      />

      <div className="map-container h_100vh">
        <div className="location-header">
          <div>
            <h3 className='britti_medium fs_16'>
              {showUserAtCurrentLocation ? "Current Location" : checkInStatus ? "Check-in Location" : "Current Location"}
            </h3>
            <p className='flex items-center gap-[6px] txt_grey fs_14 '>
              <RiMapPinLine />
              <span className='max-w-[300px] text-clamp-1 mt-[3px]'>{currentAddress}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className='equalizerBTN' onClick={handleFilterShow}>
              <RiEqualizer2Line className='w-[16px] text-[#4A8DFF]' />
            </button>
            <Link to='/notification' className='equalizerBTN relative'>
              <RiNotification3Line className='w-[20px] text-[#4A8DFF]' />
              {showNotification ? (
                <span className='Ellipse' style={{ top: '8px', left: '21px', height: '16px', width: '16px' }}></span>
              ) : null}
            </Link>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={checkInStatus && !showUserAtCurrentLocation ? 16 : 14}
          onLoad={onMapLoad}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
            scrollwheel: true,
            disableDoubleClickZoom: false,
            keyboardShortcuts: true,
            cameraControl: false,
            gestureHandling: 'cooperative'
          }}
        >

          {/* GPS Blue Dot - Always show at real GPS location */}
          {!useDefaultLocation && location?.latitude && location?.longitude && (
            <MarkerF
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 3,
              }}
              title="Your Current Location"
              zIndex={999}
            />
          )}

          {/* Current User's Check-in Marker - Show ONLY if checked in AND NOT in any stack */}
          {(() => {
            const checkInLat = localStorage.getItem('checkInLat');
            const checkInLong = localStorage.getItem('checkInLong');
            
            if (!checkInStatus || !currentUserIcon || !checkInLat || !checkInLong) {
              return null;
            }

            // Check if current user is in any group with other users
            const userInStack = groupedUsers.some(group => {
              const hasCurrentUser = group.users.some(u => u.isCurrentUser);
              const hasOtherUsers = group.users.some(u => !u.isCurrentUser);
              return hasCurrentUser && hasOtherUsers;
            });

            // Only show separate marker if user is NOT in any stack
            if (userInStack) {
              return null;
            }

            return (
              <MarkerF
                position={{ 
                  lat: parseFloat(checkInLat), 
                  lng: parseFloat(checkInLong) 
                }}
                icon={{
                  url: currentUserIcon,
                  scaledSize: new google.maps.Size(48, 48),
                  anchor: new google.maps.Point(24, 24),
                }}
                zIndex={1001}
                title="Your Check-in Location"
              />
            );
          })()}

          {/* All Users - Grouped/Stacked markers */}
          {groupedUsers?.map((group) => {
            if (!userIcons[group.id]) return null;

            const hasCurrentUser = group.users.some(u => u.isCurrentUser);
            const hasOtherUsers = group.users.some(u => !u.isCurrentUser);
            
            // If this group has ONLY current user and no others, skip
            // (will be shown as separate marker above)
            if (hasCurrentUser && !hasOtherUsers) {
              return null;
            }

            // Calculate width based on actual user count
            let width;
            const userCount = group.count;
            if (userCount === 1) {
              width = 48;
            } else if (userCount <= 3) {
              width = 48 + (userCount - 1) * 20;
            } else {
              width = 48 + (2 * 20) + 40;
            }
            
            const height = 48;
            const anchorX = width / 2;
            const anchorY = height / 2;

            return (
              <MarkerF
                key={group.id}
                position={{ lat: group.lat, lng: group.lng }}
                onClick={() => handleStackedMarkerClick(group)}
                icon={{
                  url: userIcons[group.id],
                  scaledSize: new google.maps.Size(width, height),
                  anchor: new google.maps.Point(anchorX, anchorY),
                }}
                zIndex={hasCurrentUser ? 1000 : 100}
              />
            );
          })}

        </GoogleMap>

        <FooterHome
          checkoutShow={handleCheckInStatusShow}
          checkInShow={handleCheckInShow}
          navigateToCheckIn={navigateToCheckInFromTimer}
        />
      </div>

      {/* Drawers */}
      <NearbyDrawer
        show={peopleDrawer}
        hide={handlePeopleClose}
        userData={selectedUser}
      />
      <FilterDrawer
        show={filterDrawer}
        hide={handleFilterClose}
        setFilterData={setFilterData}
      />
      <CheckIn
        show={checkInDrawer}
        hide={handleCheckInClose}
        isReplacingCheckIn={isReplacingCheckIn}
      />
      <CheckInManage
        show={checkInStatusDrawer}
        hide={handleCheckInStatusClose}
        checkInShow={handleCheckInShow}
        successDrawer={handleCompleteCheckOutShow}
      />
      <CheckOut
        show={checkOutDrawer}
        hide={handleCheckOutClose}
        successDrawer={handleCompleteCheckOutShow}
      />
      <CheckOutComplete
        show={checkoutComplete}
        checkInShow={handleCheckInShow}
        hide={handleCompleteCheckoutClose}
      />
      <VisibilityDrawer />
    </>
  );
};

export default Home;