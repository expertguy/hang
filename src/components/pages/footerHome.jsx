/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { RiAddLine, RiChat3Fill, RiCloseLine, RiCompass3Fill, RiUserFill } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import { setCheckInData, setCheckInStatus, setCheckinTime } from '../redux/appDataSlice';
import { Link, useLocation } from 'react-router-dom';
import { decryptData } from '../../utils/api/encrypted';
import ApiFunction from '../../utils/api/apiFuntions';

// Constants for localStorage keys
const CHECKIN_DATA_KEY = 'checkin_data_persistent';
const CHECKIN_STATUS_KEY = 'checkin_status_persistent';

// Utility functions for localStorage operations
const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
};

const getFromLocalStorage = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Failed to get from localStorage:', error);
        return null;
    }
};

const removeFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
    }
};

// Timer Button Component - COMPLETE WITH ALL FIXES
// Copy this entire TimerButton component to replace the existing one in FooterHome.jsx

const TimerButton = ({ checkInData, handleShow, setLocalCheckInData, navigateToCheckIn }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const dispatch = useDispatch();

    let checkInTime, durationMinutes;

    if (checkInData?.checkInTime) {
        checkInTime = new Date(checkInData.checkInTime);
        durationMinutes = checkInData?.duration || (checkInData?.checkInHours * 60) || 480;

        if (isNaN(checkInTime.getTime())) {
            console.error('Invalid check-in time:', checkInData.checkInTime);
            checkInTime = new Date();
        }
    } else {
        console.warn('No check-in time found, using current time as fallback');
        checkInTime = new Date();
        durationMinutes = checkInData?.duration || 480;
    }

    const endTime = new Date(checkInTime.getTime() + (durationMinutes * 60 * 1000));
    const totalDuration = endTime.getTime() - checkInTime.getTime();
    const elapsed = currentTime.getTime() - checkInTime.getTime();
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

    const remainingMs = Math.max(0, endTime.getTime() - currentTime.getTime());
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    const remainingTimeText = remainingHours > 0
        ? `${remainingHours}h ${remainingMinutes}m`
        : `${remainingMinutes}m`;

    const isExpired = remainingMs === 0;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
            dispatch(setCheckinTime(remainingTimeText));

            if (isExpired) {
                dispatch(setCheckInStatus(false));
                dispatch(setCheckInData({}));
                removeFromLocalStorage(CHECKIN_DATA_KEY);
                removeFromLocalStorage(CHECKIN_STATUS_KEY);
                setLocalCheckInData(null);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isExpired, dispatch, remainingTimeText, setLocalCheckInData]);

    const handleTimerClick = () => {
        handleShow();
    };

    // SVG parameters - FIXED for perfect alignment with no gap
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * progress;

    if (!checkInData || !checkInData.checkInTime) {
        return null;
    }

    return (
        <div className="relative timeProgess">
            {/* Timer Progress Ring - FIXED: Perfectly aligned, no gap */}
            <svg
                className="absolute transform -rotate-90 pointer-events-none"
                width="72"
                height="87"
                viewBox="0 0 79 79"
                style={{ 
                    left: '-7px', 
                    top: '-6px'
                }}
            >
                {/* Progress Circle */}
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#4A8DFF"
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>

            {/* Timer Button */}
            <button
                className="CheckInBTN timer-active"
                onClick={handleTimerClick}
                title="Navigate to check-in location and checkout"
                style={{
                    border: '6px solid rgba(255, 255, 255, 1)',
                    height: '58px',
                    width: '58px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#FF8447',
                    color: '#FFFFFF',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0px 4px 12px 0px #00000024',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    
                }}
            >
                <RiCloseLine size={26} />
            </button>

            {/* Timer Badge - CSS positioning se control hoga (stays above button) */}
            <div onClick={() => navigateToCheckIn()} className='remaining_Time cursor-pointer'>
                <h4 className='fs_12 mb-0'>{remainingTimeText} left</h4>
            </div>
        </div>
    );
};

const FooterHome = ({ checkoutShow, checkInShow, navigateToCheckIn }) => {
    const [localCheckInData, setLocalCheckInData] = useState(null);
    const checkInStatus = useSelector(state => state.appData?.checkInStatus);
    const DataCheckIn = useSelector(state => state.appData?.checkInData);
    const location = useLocation();
    const dispatch = useDispatch();
    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const { post } = ApiFunction();
    const checkInData = new FormData();
    checkInData.append('type', 'get_data');
    checkInData.append('table_name', 'check_in');
    checkInData.append('user_id', userToken);
    useEffect(() => {

        const getUserCheckIn = async () => {
            await post('', checkInData)
                .then(res => {
                    console.log("the response from api is", res);
                })
                .catch(err => {
                    console.log("the Error from api is", err);

                })
                .finally(() => {

                })
        }

        getUserCheckIn();

    }, [userToken]);


    // Initialize data from localStorage on component mount
    useEffect(() => {
        const persistentCheckInData = getFromLocalStorage(CHECKIN_DATA_KEY);
        const persistentCheckInStatus = getFromLocalStorage(CHECKIN_STATUS_KEY);

        if (persistentCheckInData && persistentCheckInStatus) {
            // Only restore if the timer hasn't expired
            const checkInTime = new Date(persistentCheckInData?.checkInTime);
            const durationMinutes = persistentCheckInData.duration || (persistentCheckInData.checkInHours * 60) || 480;
            const endTime = new Date(checkInTime.getTime() + (durationMinutes * 60 * 1000));
            const currentTime = new Date();

            // Check if timer is still valid (not expired)
            if (currentTime.getTime() < endTime.getTime()) {
                // Timer is still valid, restore the data
                dispatch(setCheckInData(persistentCheckInData));
                dispatch(setCheckInStatus(persistentCheckInStatus));
                setLocalCheckInData(persistentCheckInData);
            } else {
                // Timer has expired, clear everything
                removeFromLocalStorage(CHECKIN_DATA_KEY);
                removeFromLocalStorage(CHECKIN_STATUS_KEY);
                dispatch(setCheckInStatus(false));
                dispatch(setCheckInData({}));
                setLocalCheckInData(null);
            }
        }
    }, [dispatch]);

    // FIXED: Save to localStorage whenever Redux state changes
    useEffect(() => {
        if (checkInStatus && DataCheckIn) {
            if (DataCheckIn) {
                // FIXED: Create new object instead of mutating existing one
                let updatedCheckInData = DataCheckIn;

                if (!DataCheckIn.checkInTime) {
                    updatedCheckInData = {
                        ...DataCheckIn,
                        checkInTime: new Date().toISOString()
                    };
                    dispatch(setCheckInData(updatedCheckInData));
                }

                // Save to localStorage with the check-in time preserved
                saveToLocalStorage(CHECKIN_DATA_KEY, updatedCheckInData);
                saveToLocalStorage(CHECKIN_STATUS_KEY, checkInStatus);
                setLocalCheckInData(updatedCheckInData);
            }
        } else if (!checkInStatus) {
            // Clear localStorage when checked out
            removeFromLocalStorage(CHECKIN_DATA_KEY);
            removeFromLocalStorage(CHECKIN_STATUS_KEY);
            setLocalCheckInData(null);
        }
    }, [DataCheckIn, checkInStatus, dispatch]);

    return (
        <>
            <div className='Home_footer'>
                <div className="ActionBtnGroup">
                    <Link to="/home" >
                        <button className={`${location.pathname === '/home' && 'active'}`}>
                            <RiCompass3Fill className='w-[22px] h-[22px]' />
                            <span>Explore</span>
                        </button>
                    </Link>
                    <Link to={'/chat'}>
                        <button className={`${location.pathname === '/chat' && 'active'}`}>
                            <RiChat3Fill className='w-[22px] h-[22px]' />
                            {/* <span className='Ellipse' style={{background:'#000'}}></span> */}
                            <span>Chat</span>
                        </button>
                    </Link>
                    <Link to={'/setting'}>
                        <button className={`${location.pathname === '/setting' && 'active'}`}>
                            <RiUserFill className='w-[22px] h-[22px]' />
                            <span>Profile</span>
                        </button>
                    </Link>
                </div>
                {/* Conditional Check-in Button */}
                {(location?.pathname === '/home' ? <>
                    {
                        checkInStatus ? (
                            <>
                                <TimerButton
                                    checkInData={localCheckInData}
                                    handleShow={checkoutShow}
                                    setLocalCheckInData={setLocalCheckInData}
                                    navigateToCheckIn={navigateToCheckIn}
                                />
                            </>
                        ) : (
                            <button className='CheckInBTN2' style={{left:'6px'}} onClick={() => checkInShow()}>
                                <RiAddLine className='w-[26px] h-[26px]' />
                            </button>
                        )}
                </> : <></>)}


            </div>
        </>
    )
}

export default FooterHome