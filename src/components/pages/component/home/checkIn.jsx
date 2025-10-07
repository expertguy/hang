/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { RiGpsFill, RiInformation2Line, RiInformationFill, RiSearch2Line } from '@remixicon/react';
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Offcanvas, Spinner } from 'react-bootstrap'
import { RiCloseLine, RiEdit2Line } from 'react-icons/ri'
import CustomSelect from '../formElements/customSelect';
import { useDispatch, useSelector } from 'react-redux';
import { setCheckInData, setCheckInStatus, setVisibility } from '../../../redux/appDataSlice';
import { decryptData } from '../../../../utils/api/encrypted';
import useLocation from '../../../../utils/location/location';
import ApiFunction from '../../../../utils/api/apiFuntions';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const CheckIn = ({ show, hide, isReplacingCheckIn = false }) => {
    const [checkIn, setCheckIn] = useState('city');
    const [checkInHours, setcheckInHours] = useState(24);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [visibilityOpt, setVisibilityOpt] = useState(useSelector(state => state?.appData?.visibilityData));

    const dispatch = useDispatch();
    const showVisibility = () => dispatch(setVisibility(true));
    const visibilityOption = useSelector(state => state?.appData?.visibilityData);
    
    useEffect(() => {
        setVisibilityOpt(JSON.stringify(visibilityOption));
    }, [visibilityOption])

    // Store Google services references
    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const geocoder = useRef(null);

    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);

    // Your Google Places API key
    const GOOGLE_API_KEY = 'AIzaSyAP-8oI9lGS6a4iXlCdSD7bZDyz_D-FGAs';

    // Use the custom location hook
    const {
        location: geoLocation,
        loading: locationLoading,
        error: locationError,
        getCurrentLocation: getGeoLocation
    } = useLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
    });

    // Load Google Maps JavaScript API
    useEffect(() => {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
            initializeGoogleServices();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.addEventListener('load', initializeGoogleServices);
            return;
        }

        // Load Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        // Create global callback function
        window.initGoogleMaps = () => {
            initializeGoogleServices();
            delete window.initGoogleMaps; // Clean up
        };

        script.onerror = () => {
            setGoogleLoaded(false);
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
            if (window.initGoogleMaps) {
                delete window.initGoogleMaps;
            }
        };
    }, [GOOGLE_API_KEY]);

    // Initialize Google services
    const initializeGoogleServices = () => {
        try {
            if (window.google && window.google.maps && window.google.maps.places) {
                // Create a dummy map element for PlacesService (required by Google)
                const mapDiv = document.createElement('div');
                const map = new window.google.maps.Map(mapDiv);

                // Initialize services
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                placesService.current = new window.google.maps.places.PlacesService(map);
                geocoder.current = new window.google.maps.Geocoder();

                setGoogleLoaded(true);
            }
        } catch (error) {
            setGoogleLoaded(false);
        }
    };

    // Track if auto-select is in progress
    const autoSelectInProgress = useRef(false);

    // Auto-select location based on check-in type
    const autoSelectLocationByType = useCallback((type, latitude, longitude) => {
        // Prevent multiple simultaneous calls
        if (autoSelectInProgress.current) {
            return;
        }

        if (!googleLoaded || !geocoder.current || !placesService.current) {
            return;
        }

        if (!latitude || !longitude) {
            return;
        }

        autoSelectInProgress.current = true;
        setLoading(true);

        if (type === 'city') {
            // Auto-select city based on current coordinates
            const latlng = { lat: latitude, lng: longitude };
            
            geocoder.current.geocode({ location: latlng }, (results, status) => {
                
                if (status === window.google.maps.GeocoderStatus.OK && results) {
                    // Find the locality (city) from results
                    const cityResult = results.find(result => 
                        result.types.includes('locality') || 
                        result.types.includes('administrative_area_level_2')
                    );

                    if (cityResult) {
                        let cityName = '';
                        let countryName = '';
                        let stateName = '';

                        cityResult.address_components.forEach(component => {
                            const types = component.types;
                            if (types.includes('locality')) {
                                cityName = component.long_name;
                            } else if (types.includes('administrative_area_level_2') && !cityName) {
                                cityName = component.long_name;
                            }
                            if (types.includes('country')) {
                                countryName = component.long_name;
                            }
                            if (types.includes('administrative_area_level_1')) {
                                stateName = component.long_name;
                            }
                        });

                        const cityLocation = {
                            id: cityResult.place_id,
                            place_id: cityResult.place_id,
                            name: cityName || 'Current City',
                            fullName: cityResult.formatted_address,
                            type: 'city',
                            country: countryName,
                            state: stateName,
                            city: cityName,
                            lat: cityResult.geometry.location.lat(),
                            lon: cityResult.geometry.location.lng()
                        };

                        setSelectedLocation(cityLocation);
                    } else {
                        if (userLocation) {
                            setSelectedLocation(userLocation);
                        }
                    }
                } else {
                    if (userLocation) {
                        setSelectedLocation(userLocation);
                    }
                }
                setLoading(false);
                autoSelectInProgress.current = false;
            });

        } else if (type === 'venue') {
            
            // Auto-select nearest venue
            const location = new window.google.maps.LatLng(latitude, longitude);
            
            const request = {
                location: location,
                radius: 1000,
                type: ['restaurant', 'cafe', 'store', 'shopping_mall', 'bar', 'gym', 'library', 'park']
            };


            placesService.current.nearbySearch(request, (results, status) => {
                
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    
                    // Get the nearest venue (first result)
                    const nearestVenue = results[0];
                    
                    // Get detailed information about the venue
                    const detailRequest = {
                        placeId: nearestVenue.place_id,
                        fields: ['geometry', 'name', 'formatted_address', 'address_components', 'place_id']
                    };


                    placesService.current.getDetails(detailRequest, (place, detailStatus) => {
                        
                        if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && place) {
                            let venueLocation = {
                                id: place.place_id,
                                place_id: place.place_id,
                                name: place.name,
                                fullName: place.formatted_address || place.name,
                                type: 'venue',
                                country: '',
                                state: '',
                                city: '',
                                lat: place.geometry.location.lat(),
                                lon: place.geometry.location.lng()
                            };

                            // Parse address components
                            if (place.address_components) {
                                place.address_components.forEach(component => {
                                    const types = component.types;
                                    if (types.includes('country')) {
                                        venueLocation.country = component.long_name;
                                    }
                                    if (types.includes('administrative_area_level_1')) {
                                        venueLocation.state = component.long_name;
                                    }
                                    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                                        venueLocation.city = component.long_name;
                                    }
                                });
                            }

                            setSelectedLocation(venueLocation);
                        } else {
                            if (userLocation) {
                                setSelectedLocation(userLocation);
                            }
                        }
                        setLoading(false);
                        autoSelectInProgress.current = false;
                    });
                } else {
                    
                    if (userLocation) {
                        setSelectedLocation(userLocation);
                    }
                    setLoading(false);
                    autoSelectInProgress.current = false;
                }
            });
        }
    }, [googleLoaded, userLocation]);

    const setCheckInButton = useCallback((value) => {
        const newType = value === 0 ? 'city' : 'venue';
        const newHours = value === 0 ? 24 : 1;
        
        setCheckIn(newType);
        setcheckInHours(newHours);
        setLocations([]);

        if (!userLocation) {
            console.warn('⚠️ userLocation not available yet');
            return;
        }

        if (newType === 'city') {
            // For CITY mode: Auto-select the city based on coordinates
            if (googleLoaded && geoLocation && geoLocation.latitude && geoLocation.longitude) {
                autoSelectLocationByType('city', geoLocation.latitude, geoLocation.longitude);
            } else if (userLocation.city) {
                // Fallback: Use city from userLocation
                const cityLocation = {
                    ...userLocation,
                    type: 'city',
                    name: userLocation.city // Show only city name for city mode
                };
                setSelectedLocation(cityLocation);
            }
        } else {
            // For VENUE mode: Use full address from current location
            const venueLocation = {
                ...userLocation,
                type: 'venue',
                name: userLocation.fullName || userLocation.name // Show full address for venue mode
            };
            setSelectedLocation(venueLocation);
        }
    }, [userLocation, googleLoaded, geoLocation, autoSelectLocationByType]);

    // Fetch locations using Google Places AutocompleteService
    const fetchLocations = useCallback((query = '') => {
        if (!query || query.length < 2 || !googleLoaded || !autocompleteService.current) {
            setLocations([]);
            return;
        }

        setLoading(true);

        // Configure request based on check-in type
        const request = {
            input: query,
            types: checkIn === 'city' ? ['(cities)'] : ['establishment']
        };

        // Get predictions from Google
        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                // Process each prediction to get detailed information
                const processedLocations = [];
                let processedCount = 0;
                const totalPredictions = Math.min(predictions.length, 8); // Limit to 8 results

                if (totalPredictions === 0) {
                    setLocations([]);
                    setLoading(false);
                    return;
                }

                predictions.slice(0, totalPredictions).forEach((prediction) => {

                    // Get place details for each prediction
                    const detailRequest = {
                        placeId: prediction.place_id,
                        fields: ['geometry', 'name', 'formatted_address', 'address_components']
                    };

                    placesService.current.getDetails(detailRequest, (place, detailStatus) => {
                        let locationData = {
                            id: prediction.place_id,
                            place_id: prediction.place_id,
                            name: prediction.structured_formatting?.main_text || prediction.description,
                            fullName: prediction.description,
                            type: checkIn,
                            country: '',
                            state: '',
                            city: '',
                            lat: 0,
                            lon: 0
                        };

                        // If place details were retrieved successfully
                        if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && place) {
                            // Get coordinates
                            if (place.geometry && place.geometry.location) {
                                locationData.lat = place.geometry.location.lat();
                                locationData.lon = place.geometry.location.lng();
                            }

                            // Parse address components
                            if (place.address_components) {
                                place.address_components.forEach(component => {
                                    const types = component.types;
                                    if (types.includes('country')) {
                                        locationData.country = component.long_name;
                                    }
                                    if (types.includes('administrative_area_level_1')) {
                                        locationData.state = component.long_name;
                                    }
                                    if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                                        locationData.city = component.long_name;
                                    }
                                });
                            }

                            // Use formatted address if available
                            if (place.formatted_address) {
                                locationData.fullName = place.formatted_address;
                            }
                        }

                        processedLocations.push(locationData);
                        processedCount++;

                        // Update state when all predictions are processed
                        if (processedCount === totalPredictions) {
                            setLocations(processedLocations);
                            setLoading(false);
                        }
                    });
                });
            } else {
                setLocations([]);
                setLoading(false);
            }
        });
    }, [checkIn, googleLoaded]);

    // Process current location using Google Geocoder
    const processLocationData = useCallback((latitude, longitude) => {
        const defaultLocationData = {
            id: 'current',
            place_id: null,
            name: 'Current Location',
            fullName: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lon: longitude,
            type: 'current',
            country: '',
            state: '',
            city: ''
        };

        if (!googleLoaded || !geocoder.current) {
            setUserLocation(defaultLocationData);
            setSelectedLocation(defaultLocationData);
            return;
        }

        // Use Google Geocoder for reverse geocoding
        const latlng = { lat: latitude, lng: longitude };

        geocoder.current.geocode({ location: latlng }, (results, status) => {
            let locationData = { ...defaultLocationData };

            if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
                const result = results[0];

                // Parse address components
                if (result.address_components) {
                    let cityName = '';
                    let countryName = '';
                    let stateName = '';

                    result.address_components.forEach(component => {
                        const types = component.types;
                        if (types.includes('locality')) {
                            cityName = component.long_name;
                        } else if (types.includes('administrative_area_level_2') && !cityName) {
                            cityName = component.long_name;
                        }
                        if (types.includes('country')) {
                            countryName = component.long_name;
                        }
                        if (types.includes('administrative_area_level_1')) {
                            stateName = component.long_name;
                        }
                    });

                    // Use the formatted address as the display name
                    const displayName = result.formatted_address || cityName || 'Current Location';

                    locationData = {
                        ...defaultLocationData,
                        name: displayName,  // Use full formatted address
                        fullName: result.formatted_address || defaultLocationData.fullName,
                        country: countryName,
                        state: stateName,
                        city: cityName
                    };
                }
            }

            setUserLocation(locationData);
            // Don't auto-select here - let the setCheckInButton handle it
        });
    }, [googleLoaded]);

    // Handle getting current location
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }
        getGeoLocation();
    }, [getGeoLocation]);

    useEffect(() => {
        getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    // Effect to handle location changes
    useEffect(() => {
        if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
            processLocationData(geoLocation.latitude, geoLocation.longitude);
        }
    }, [geoLocation, processLocationData]);

    // Effect to handle location errors
    useEffect(() => {
        if (locationError) {
            let errorMessage = 'Unable to retrieve your location. ';
            if (locationError.includes('denied')) {
                errorMessage += 'Please allow location access and try again.';
            } else if (locationError.includes('unavailable')) {
                errorMessage += 'Location information is unavailable.';
            } else if (locationError.includes('timeout')) {
                errorMessage += 'Location request timed out.';
            } else {
                errorMessage += 'Please search manually.';
            }
            alert(errorMessage);
        }
    }, [locationError]);

    // Handle location selection
    const handleLocationSelect = useCallback((location) => {
        setSelectedLocation(location);
    }, []);

    // Handle search with debouncing
    const handleLocationSearch = useCallback((searchQuery) => {
        if (searchQuery && searchQuery.length >= 2) {
            // Clear previous timeout
            if (window.searchTimeout) {
                clearTimeout(window.searchTimeout);
            }

            // Set new timeout for debouncing
            window.searchTimeout = setTimeout(() => {
                fetchLocations(searchQuery);
            }, 500);
        } else {
            setLocations([]);
        }
    }, [fetchLocations]);

    const { post } = ApiFunction();

    const onsubmit = async () => {
        if (!selectedLocation) {
            alert('Please select a location before checking in.');
            return;
        }

        setLoading(true);
        
        // Check if user is already checked in and needs to checkout first
        const existingCheckInData = localStorage.getItem('checkInData');
        let existingCheckInId = null;
        
        if (existingCheckInData) {
            try {
                const parsedData = JSON.parse(existingCheckInData);
                existingCheckInId = parsedData.checkInId;
                
                // If user is replacing check-in, checkout from previous location first
                if (existingCheckInId && isReplacingCheckIn) {
                    
                    const checkoutData = new FormData();
                    checkoutData.append('type', 'update_data');
                    checkoutData.append('user_id', userToken);
                    checkoutData.append('id', existingCheckInId);
                    checkoutData.append('table_name', 'check_in');
                    checkoutData.append('checkout_time', new Date().toISOString());
                    checkoutData.append('checkout_type', 'auto_replacement');
                    
                    try {
                        const checkoutRes = await post('', checkoutData);
                        
                        // Clear previous check-in data
                        localStorage.removeItem('checkInLat');
                        localStorage.removeItem('checkInLong');
                        localStorage.removeItem('checkInData');
                        localStorage.removeItem('checkin_data_persistent');
                        localStorage.removeItem('checkin_status_persistent');
                        
                        // Reset Redux state temporarily
                        dispatch(setCheckInStatus(false));
                        dispatch(setCheckInData({}));
                        
                    } catch (checkoutErr) {
                        console.error('❌ Auto-checkout failed:', checkoutErr);
                        // Continue with check-in even if checkout fails
                    }
                }
            } catch (error) {
                console.error('Error parsing existing check-in data:', error);
            }
        }
        
        // Proceed with new check-in
        const currentDateTime = new Date().toLocaleString('sv-SE', { hour12: false });
        const checkInMin = checkInHours * 60;
        const data = new FormData();
        data.append('user_id', userToken);
        data.append('type', 'add_data');
        data.append('table_name', 'check_in');
        data.append('check_type', checkIn);
        data.append('duration', checkInMin);
        data.append('checkin_time', currentDateTime);
        data.append('status_text', message);
        data.append('visibility', visibilityOpt);

        // Add selected location data
        if (selectedLocation) {
            data.append('address', selectedLocation?.fullName);
            data.append('lat', selectedLocation?.lat);
            data.append('lng', selectedLocation?.lon);
            data.append('place_name', selectedLocation?.name);

            // Critical: Handle coordinate storage properly
            if (selectedLocation.id !== 'current' && selectedLocation.type !== 'current') {
                // Store the selected place/venue coordinates for navigation
                localStorage.setItem('checkInLong', selectedLocation?.lon.toString());
                localStorage.setItem('checkInLat', selectedLocation?.lat.toString());
                localStorage.setItem('checkInType', checkIn);
                localStorage.setItem('checkInPlaceName', selectedLocation?.name || '');
                
            } else {
                // User selected "Current Location" - remove stored coordinates
                // This ensures the map uses real-time GPS location
                localStorage.removeItem('checkInLong');
                localStorage.removeItem('checkInLat');
                localStorage.removeItem('checkInType');
                localStorage.removeItem('checkInPlaceName');
            }

            // Add place_id if available (important for Google Places reference)
            if (selectedLocation?.place_id && selectedLocation?.place_id !== 'current') {
                data.append('place_id', selectedLocation?.place_id);
            }
        }

        try {
            const res = await post('', data);
            // Create comprehensive check-in data for Redux store
            const checkInData = {
                checkInType: checkIn,
                duration: checkInMin,
                checkInId: res?.id || null,
                status_text: message ?? "",
                location: {
                    ...selectedLocation,
                    place_id: selectedLocation?.place_id || null
                },
                userLocation: geoLocation,
                place_id: selectedLocation?.place_id && selectedLocation?.place_id !== 'current' ? selectedLocation?.place_id : null,
                place_name: selectedLocation?.name ? selectedLocation?.name : null,
                checkInTime: new Date().toISOString(),
                expiryTime: new Date(Date.now() + (checkInMin * 60 * 1000)).toISOString()
            }
            // Store complete check-in data in localStorage for persistence across app restarts
            localStorage.setItem('checkInData', JSON.stringify(checkInData));

            // Update Redux state - this will trigger navigation in Home component
            dispatch(setCheckInStatus(true));
            dispatch(setCheckInData(checkInData));
            
            // Show appropriate success message
            const successMessage = isReplacingCheckIn 
                ? 'Successfully moved to new location!' 
                : 'Checked in successfully!';
                
            toast.success(successMessage, {
                icon: <Link to="/notification"><RiInformation2Line /></Link>
            });
            // Close the drawer
            hide();
            
            // Success feedback
            setTimeout(() => {
                const locationText = selectedLocation.id === 'current' 
                    ? 'your current location' 
                    : selectedLocation.name;
            }, 500);

        } catch (err) {
            console.log("Error in checkIn:", err);
            alert('Failed to check in. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Clear form when drawer closes
    useEffect(() => {
        if (!show) {
            setMessage('');
            setLocations([]);
        }
    }, [show]);
    
    // Re-set location when drawer opens - only if not already selected
    useEffect(() => {
        if (show && geoLocation && geoLocation.latitude && geoLocation.longitude && googleLoaded) {
            // Only auto-select if no location is selected yet
            if (!selectedLocation) {
                autoSelectLocationByType(checkIn, geoLocation.latitude, geoLocation.longitude);
            }
        }
    }, [show, geoLocation, googleLoaded]);

    // Auto-clear expired check-in data on component mount
    useEffect(() => {
        const checkExpiredData = () => {
            try {
                const storedCheckInData = localStorage.getItem('checkInData');
                if (storedCheckInData) {
                    const checkInData = JSON.parse(storedCheckInData);
                    const expiryTime = checkInData.expiryTime;
                    
                    if (expiryTime && new Date() > new Date(expiryTime)) {
                        // Check-in has expired, clear all data
                        localStorage.removeItem('checkInLong');
                        localStorage.removeItem('checkInLat');
                        localStorage.removeItem('checkInType');
                        localStorage.removeItem('checkInPlaceName');
                        localStorage.removeItem('checkInData');
                        dispatch(setCheckInStatus(false));
                        dispatch(setCheckInData(null));
                    }
                }
            } catch (error) {
                console.error('Error checking expired check-in data:', error);
            }
        };

        checkExpiredData();
    }, [dispatch]);

    return (
        <>
            <Offcanvas
                backdropClassName="blurred-backdrop-offcanvas"
                show={show}
                placement='bottom'
                onHide={hide}
                className="offcanvas-bottom offcanvasBG"
            >
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>New Check In</h1>
                    <RiCloseLine onClick={hide} className='w-[24px] h-[24px] absolute right-5 cursor-pointer' />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className='flex flex-col pt-[20px] h-100 sm:px-[15px] w-full'>

                        {/* Header */}
                        <h1 className='text-start fs_20 britti_medium'>
                            {isReplacingCheckIn ? 'Move to New Location' : 'Share Your Location'}
                        </h1>
                        <h2 className='txt_grey fs_16'>
                            {isReplacingCheckIn 
                                ? "You'll be automatically checked out from your current location and checked in to the new one" 
                                : 'Your check-in will allow interesting people nearby to discover you'
                            }
                        </h2>

                        {/* Visibility Selection */}
                        <h1 className='text-start fs_14 britti_medium mt-3'>Who can see me?</h1>
                        <div className='w-full mt-2 interestsGroup'>
                            {visibilityOption?.map((value, index) => (
                                <div className="interestItem" key={index}>
                                    <div className={"flex items-center capitalize justify-center h-100 px-[12px] border-1 border-transparent"}>
                                        {value !== 'everyone' ? "Same" : ""} {value}
                                    </div>
                                </div>
                            ))}

                            <button className="interestItem cursor-pointer" onClick={() => showVisibility()}>
                                <div className="flex  items-center justify-center h-100 px-[8px] border-1 border-transparent">
                                    <RiEdit2Line className='w-[17px] h-[17px]' />
                                </div>
                            </button>
                        </div>

                        {/* Check-in Type Selection */}
                        <h1 className='text-start fs_14 britti_medium mt-3'>Check-in Type</h1>
                        <div className='mx-0'>
                            <div className='mx-auto mb-2 max-w-[450px]'>
                                <div className="flex gap-3 items-center w-full">
                                    <div className='flex justify-center w-full'>
                                        <div className='bg-[#E1E4EA] rounded-[13px] p-1 pickup_group two_btn_group w-full'>
                                            <div className='d-flex position-relative'>
                                                <button
                                                    className={`pickup_btn ${checkIn === 'city' ? 'active' : ''}`}
                                                    onClick={() => setCheckInButton(0)}
                                                >
                                                    City
                                                </button>
                                                <button
                                                    className={`pickup_btn ${checkIn === 'venue' ? 'active' : ''}`}
                                                    onClick={() => setCheckInButton(1)}
                                                >
                                                    Venue
                                                </button>
                                                <div className='sliding-background'></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span className='txt_grey flex items-center fs_14 gap-1'>
                            <RiInformationFill className='w-[18px] relative bottom-[1px] h-[18px] grey_icon' />
                            You'll be visible to others in the same {checkIn}
                        </span>

                        {/* Location Selection */}
                        <h1 className='text-start fs_14 britti_medium mt-3'>Select Location</h1>
                         <CustomSelect
                            data={locations}
                            selectedItem={selectedLocation}
                            onSelectionChange={handleLocationSelect}
                            onSearch={handleLocationSearch}
                            placeholder={checkIn === 'city' ? "Search for a city..." : "Search for a venue..."}
                            searchPlaceholder="Type to search locations..."
                            displayKey="name"
                            searchKey="name"
                            loading={loading}
                            emptyMessage={`No ${checkIn === 'city' ? 'cities' : 'venues'} found. Start typing to search.`}
                            icon={<RiSearch2Line className='w-[20px] h-[20px] grey_icon me-1 relative bottom-[1px]' />}
                            rightIcon={
                                <div
                                    className="cursor-pointer"
                                    onClick={getCurrentLocation}
                                    title="Use current location"
                                >
                                    <RiGpsFill className={`txt_primary w-[19px] h-[19px] ${locationLoading ? 'animate-pulse' : ''}`} />
                                </div>
                            }
                            color='var(--primary)'
                            className="mt-2"
                        />

                        {/* Duration Selection */}
                        <h1 className='text-start fs_14 britti_medium mt-4'>How long will you be here?</h1>
                        <div className='mx-0'>
                            <div className='mx-auto mb-2'>
                                {checkIn === 'city' ? (
                                    <div className="flex gap-3 items-center w-full">
                                        <div className='flex justify-center w-full'>
                                            <div className='bg-[#E1E4EA] rounded-[13px] p-1 pickup_group two_btn_group w-full'>
                                                <div className='d-flex position-relative'>
                                                    <button
                                                        className={`pickup_btn ${checkInHours === 24 ? 'active' : ''}`}
                                                        onClick={() => setcheckInHours(24)}
                                                    >
                                                        24Hrs
                                                    </button>
                                                    <button
                                                        className={`pickup_btn ${checkInHours === 48 ? 'active' : ''}`}
                                                        onClick={() => setcheckInHours(48)}
                                                    >
                                                        48Hrs
                                                    </button>
                                                    <div className='sliding-background'></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex justify-center w-full max-w-[600px] mx-auto'>
                                        <div className='flex justify-center w-full mb-3'>
                                            <div className='four_btn_group w-full'>
                                                <div className='d-flex position-relative p-1'>
                                                    <button
                                                        className={`nav_btn whitespace-nowrap ${checkInHours === 1 ? 'active' : ''}`}
                                                        onClick={() => setcheckInHours(1)}
                                                    >
                                                        1Hr
                                                    </button>
                                                    <button
                                                        className={`nav_btn whitespace-nowrap relative left-1 ${checkInHours === 2 ? 'active' : ''}`}
                                                        onClick={() => setcheckInHours(2)}
                                                    >
                                                        2Hr
                                                    </button>
                                                    <button
                                                        className={`nav_btn whitespace-nowrap relative left-1 ${checkInHours === 3 ? 'active' : ''}`}
                                                        onClick={() => setcheckInHours(3)}
                                                    >
                                                        3Hr
                                                    </button>
                                                    <button
                                                        className={`nav_btn whitespace-nowrap ${checkInHours === 4 ? 'active' : ''}`}
                                                        onClick={() => setcheckInHours(4)}
                                                    >
                                                        4Hr
                                                    </button>
                                                    <div className='nav-slider'></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Message */}
                        <h1 className='text-start fs_14 britti_medium'>
                            Add a status message <span className='txt_grey'>(optional)</span>
                        </h1>
                        <div className='customInput'>
                            <input
                                type="text"
                                placeholder='e.g., "Open to chat & cowork!"'
                                onChange={(e) => setMessage(e.target.value)}
                                value={message}
                                name=""
                                id=""
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="btnGroup grid grid-cols-1 w-full gap-2 mt-4">
                            <button
                                disabled={loading || !selectedLocation || !googleLoaded}
                                className={`primary_btn w-full rounded-[12px] ${(!selectedLocation || loading || !googleLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={onsubmit}
                            >
                                {loading ? (
                                    <Spinner animation="border" size='md' variant="light" />
                                ) : !googleLoaded ? (
                                    "Loading Google Maps..."
                                ) : isReplacingCheckIn ? (
                                    `Move to ${selectedLocation ? selectedLocation.name : 'New Location'}`
                                ) : (
                                    `Check In ${selectedLocation ? `at ${selectedLocation.name}` : ''}`
                                )}
                            </button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default CheckIn