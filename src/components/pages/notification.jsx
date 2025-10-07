/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { RiArrowLeftLine } from 'react-icons/ri'
import FooterHome from './footerHome'
import { Link } from 'react-router-dom'
import ApiFunction from '../../utils/api/apiFuntions'
import { useSelector } from 'react-redux'
import { decryptData } from '../../utils/api/encrypted'
import { Megaphone } from '../icons/icons'

const Notification = () => {
    const [loading, setLoading] = useState(false);
    const { post } = ApiFunction();
    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const [notification, setNotification] = useState(null);
    const [groupedNotifications, setGroupedNotifications] = useState({});
    const intervalRef = useRef(null);
    const isLoadingRef = useRef(false);
    const userTokenRef = useRef(userToken);
    const [promoTitle, setPromoTitle] = useState('');
    const [promoMessage, setPromoMessage] = useState('');

    // Update ref when userToken changes
    useEffect(() => {
        userTokenRef.current = userToken;
    }, [userToken]);
    const data = new FormData();
    data.append('type', 'get_data');
    data.append('table_name', 'preferences');
    data.append('id', 1);

    useEffect(() => {
        const getPreferences = async () => {
            setLoading(true);
            await post('', data)
                .then(response => {
                    if (response?.data) {
                        setPromoTitle(response?.data[0]?.promo_title);
                        setPromoMessage(response?.data[0]?.promo_message);
                    } else {
                        console.log("the response from server is not correct");
                    }
                })
                .catch(err => {
                    console.log("there is an error in the response =>", err);
                })
                .finally(() => {
                    setLoading(false);
                })
        }

        getPreferences();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

const notiData = new FormData();
    notiData.append('type','update_all_data');
    notiData.append('table_name','notifications');
    notiData.append('user_id',userToken);
    notiData.append('seen',1);
    useEffect(()=>{
        const updateNotification = async ()=> {
            await post('',notiData)
            .then(res => {
                if(res?.result === true){
                    
                }
            })
            .catch(err => {

            })
            .finally(() => {

            })
        }
        updateNotification();
    })

    // Function to format date for display
    const formatDateForDisplay = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const notificationDate = new Date(date);

        if (notificationDate.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (notificationDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return notificationDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Function to check if notification is within 30 minutes
    const isWithin30Minutes = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = (now - notificationTime) / (1000 * 60);
        return diffInMinutes <= 30;
    };

    // Function to format time with AM/PM
    const formatTimeWithAMPM = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Function to group notifications
    const groupNotificationsByTime = (notifications) => {
        const groups = {
            newMessages: [],
            today: [],
            yesterday: [],
            older: {}
        };

        notifications.forEach(notification => {
            const timestamp = notification.timestamp;

            if (isWithin30Minutes(timestamp)) {
                groups.newMessages.push(notification);
            } else {
                const dateKey = formatDateForDisplay(timestamp);

                if (dateKey === 'Today') {
                    groups.today.push(notification);
                } else if (dateKey === 'Yesterday') {
                    groups.yesterday.push(notification);
                } else {
                    if (!groups.older[dateKey]) {
                        groups.older[dateKey] = [];
                    }
                    groups.older[dateKey].push(notification);
                }
            }
        });

        // Sort notifications within each group by timestamp (newest first)
        groups.newMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        groups.today.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        groups.yesterday.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        Object.keys(groups.older).forEach(key => {
            groups.older[key].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });

        return groups;
    };

    // API call function with useCallback for stability
    const getNotification = useCallback(async (showLoader = true) => {
        if (!userTokenRef.current || isLoadingRef.current) return;

        isLoadingRef.current = true;
        console.log('Notification API called at:', new Date().toLocaleTimeString());

        const data = new FormData();
        data.append('type', 'notifications');
        data.append('user_id', userTokenRef.current);

        if (showLoader) {
            setLoading(true);
        }

        try {
            const res = await post('', data);
            if (res?.result) {
                setNotification(res?.service);
                const grouped = groupNotificationsByTime(res?.service);
                setGroupedNotifications(grouped);
                console.log("Notifications =>", res);
                console.log("Grouped notifications =>", grouped);
            }
        } catch (err) {
            console.log("Error from notifications API =>", err);
        } finally {
            if (showLoader) {
                setLoading(false);
            }
            isLoadingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // No dependencies for stable function

    useEffect(() => {
        if (!userToken) return;

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Call immediately with loader
        getNotification(true);

        // Set interval for every 10 seconds (without loader for subsequent calls)
        intervalRef.current = setInterval(() => {
            console.log('Notification interval triggered at:', new Date().toLocaleTimeString());
            getNotification(false); // No loader for interval calls
        }, 10000);

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [userToken, getNotification]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Helper function to check if image is valid
    const hasValidImage = (imageUrl) => {
        return imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' && imageUrl.toLowerCase() !== 'https://app.hangnetwork.com/images/';
        // return imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '';
    };

    // Component to render notification card (new messages)
    const NotificationCard = ({ notification }) => (
        <div className="noti_Card new">
            <div className='flex gap-[10px]'>
                {hasValidImage(notification?.image) && (
                    <div className='relative h-min'>
                        <img src={notification?.image} className='userPIC' alt="" />
                    </div>
                )}
                <div className='flex items-start flex-col gap-[5px] w-full'>
                    <div className='flex items-center justify-between w-full'>
                        <h2 className='mb-0 fs_20 britti_medium '>{notification?.title}</h2>
                        <span className='fs_12 grey_icon'>{formatTimeWithAMPM(notification?.timestamp)}</span>
                    </div>
                    <p className='britti_light fs_14 txt_grey mb-0 text-clamp-1'>{notification?.notification}</p>
                </div>
            </div>
        </div>
    );

    // Component to render old notification card
    const OldNotificationCard = ({ notification }) => (
        <div className="noti_Card">
            <div className='flex gap-[10px]'>
                {hasValidImage(notification?.image) && (
                    <div className='relative'>
                        <img src={notification.image} className='userPIC' alt="" />
                        <div className={`status_badge status_active`}></div>
                    </div>
                )}
                <div className='flex items-start flex-col gap-[5px] w-full'>
                    <div className='flex items-center justify-between w-full'>
                        <h2 className='mb-0 fs_20 britti_medium '>{notification?.title}</h2>
                        <span className='fs_12 grey_icon'>{formatTimeWithAMPM(notification?.timestamp)}</span>
                    </div>
                    <p className='britti_light fs_14 txt_grey mb-0'>{notification?.notification}</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className=' h_100vh'>
                <div className="p-4 border-b border-[#E1E4EA] relative">
                    <Link to={'/setting'} className='absolute top-[23px] left-[20px] z-10'>
                        <RiArrowLeftLine className='w-[24px]  h-[24px]' />
                    </Link>
                    <h1 className='fs_18 mb-0 text-center britti relative top-[3px]'>Notifications</h1>

                </div>
                {/* <div className='chatHeader  p-4 pb-3'>
                    <Link to={'/setting'}>
                        <RiArrowLeftLine className='w-[20px] h-[20px]' />
                    </Link>
                    <div>
                        <h1 className='britti_bold fs_18 mb-0 ms-2 text-[#0E121B]'>Notifications</h1>
                    </div>
                </div> */}

                <div className='main_body p-4 '>
                    <div className='gap-[18px] flex flex-col pb-[60px]'>
                        {promoTitle && promoTitle !== '' && promoMessage && promoMessage !== '' && <>
                            <div>
                                <h1 className='grey_icon fs_16 mb-3 britti_medium'>Promotions</h1>
                                <div className='bg-[#EDF4FF] flex gap-4 px-4 py-3 rounded-[16px]'>
                                    <img src={Megaphone} alt="" className='w-[40px]' />
                                    <div>
                                        <h1 className='fs_14 britti_bold'>{promoTitle}</h1>
                                        <p className='fs_14 text-[#0E121B] britti_light'>{promoMessage}</p>
                                    </div>
                                </div>
                            </div>
                        </>}
                        {loading ? (
                            <div className="text-center py-8">
                                <p className='grey_icon fs_16'>Loading notifications...</p>
                            </div>
                        ) : (
                            <>
                                {/* New Messages (within 30 minutes) */}
                                {groupedNotifications?.newMessages?.length > 0 && (
                                    <div>
                                        <h1 className='grey_icon fs_16 mb-3 britti_medium'>New Message</h1>
                                        <div className='gap-[18px] flex flex-col'>
                                            {groupedNotifications.newMessages.map((notification, idx) => (
                                                <NotificationCard key={`new-${idx}`} notification={notification} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Today's Messages (older than 30 minutes) */}
                                {groupedNotifications?.today?.length > 0 && (
                                    <div>
                                        <h1 className='grey_icon fs_16 mb-3 britti_medium mt-2'>Today</h1>
                                        <div className='gap-[18px] flex flex-col'>
                                            {groupedNotifications.today.map((notification, idx) => (
                                                <OldNotificationCard key={`today-${idx}`} notification={notification} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Yesterday's Messages */}
                                {groupedNotifications?.yesterday?.length > 0 && (
                                    <div>
                                        <h1 className='grey_icon fs_16 mb-3 britti_medium mt-2'>Yesterday</h1>
                                        <div className='gap-[18px] flex flex-col'>
                                            {groupedNotifications.yesterday.map((notification, idx) => (
                                                <OldNotificationCard key={`yesterday-${idx}`} notification={notification} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Older Messages (grouped by date) */}
                                {Object.keys(groupedNotifications?.older || {}).map(dateKey => (
                                    <div key={dateKey}>
                                        <h1 className='grey_icon fs_16 mb-3 britti_medium mt-2'>{dateKey}</h1>
                                        <div className='gap-[18px] flex flex-col'>
                                            {groupedNotifications.older[dateKey].map((notification, idx) => (
                                                <OldNotificationCard key={`${dateKey}-${idx}`} notification={notification} />
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* No notifications message */}
                                {(!groupedNotifications?.newMessages?.length &&
                                    !groupedNotifications?.today?.length &&
                                    !groupedNotifications?.yesterday?.length &&
                                    Object.keys(groupedNotifications?.older || {}).length === 0) && (
                                        <div className='text-center py-8'>
                                            <p className='grey_icon fs_16'>No notifications found</p>
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <FooterHome />
        </>
    )
}

export default Notification