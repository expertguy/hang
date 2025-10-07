import React, { useEffect, useState } from 'react'
import { RiMapPinLine, RiNotification3Line, RiRecordCircleLine } from 'react-icons/ri'
import { LocationIcon} from '../icons/icons';
import CheckIn from './component/home/checkIn';
import { useSelector } from 'react-redux';
import { decryptData } from '../../utils/api/encrypted';
import FooterHome from './footerHome';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApiFunction from '../../utils/api/apiFuntions';
import PersonalChatList from './personalChatList';

const Chat = () => {
    const [chatType, setChatType] = useState(0);
    const [checkInDrawer, setCheckInDrawer] = useState(false);
    const [checkInData, setCheckInData] = useState(null);
    const [place_id, setPlaceId] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);
    // Location state
    const [currentLocation, setCurrentLocation] = useState('Loading location...');
    const [locationError, setLocationError] = useState(false);

    const showCheckIn = () => setCheckInDrawer(true);
    const hideCheckIn = () => setCheckInDrawer(false);

    const checkInStatus = useSelector(state => state.appData?.checkInStatus);
    const checkIndata = useSelector(state => state.appData?.checkInData);
    const [groupDetails, setGroupDetails] = useState(null);
    useEffect(() => {
        setPlaceId(checkIndata?.place_id);
    }, [checkIndata]);

    useEffect(() => {

        const getGroupDetails = async () => {

            const data = {
                type: 'get_group_conversation',
                place_id: place_id
            }

            await post('', data)
                .then(res => {
                    if (res) {
                        setGroupDetails(res);
                    }
                })
                .catch(err => {
                    console.log("there is an error fetching groupDetails =>", err);
                })
        }



        if (checkInStatus && place_id) {
            getGroupDetails();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkInStatus, place_id])

    const { post } = ApiFunction();
    // Function to get current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setCurrentLocation('Geolocation not supported');
            setLocationError(true);
            return;
        }

        setCurrentLocation('your location...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Using a free reverse geocoding service
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const address = `${data.locality || data.city || 'Unknown City'}, ${data.countryName || 'Unknown Country'}`;
                        setCurrentLocation(address);
                        setLocationError(false);
                    } else {
                        throw new Error('Failed to get address');
                    }
                } catch (error) {
                    console.error('Error getting address:', error);
                    setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    setLocationError(false);
                }
            },
            (error) => {
                console.error('Error getting location:', error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setCurrentLocation('Location access denied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setCurrentLocation('Location unavailable');
                        break;
                    case error.TIMEOUT:
                        setCurrentLocation('Location request timeout');
                        break;
                    default:
                        setCurrentLocation('Unknown location error');
                        break;
                }
                setLocationError(true);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // Cache for 5 minutes
            }
        );
    };


    const encryptedToken = useSelector(state => state.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const navigate = useNavigate();
    const joinConversation = async () => {
        setLoading(true)

        const data = new FormData();
        data.append('user_id', userToken);
        data.append('type', 'join_group_conversation');
        data.append('place_id', place_id);
        data.append('name', 'Faisalabad Hangout Group');


        await post('', data)
            .then(res => {
                if (res?.result) {
                    const id = res?.conversation_id;
                    navigate(`/chat/${id}`);
                    toast.success('Successfully joined conversation');
                }
            })
            .catch(err => {
                toast.error("there is an error connecting to this Group");
                console.log("the error in group connect is =>", err);
            })
            .finally(() => {
                setLoading(false);
            })

    }

    useEffect(() => {
        if (checkIndata) {
            setCheckInData(checkIndata);
        }
    }, [checkIndata]);

    // Get location on component mount
    useEffect(() => {
        getCurrentLocation();
    }, []);

    return (
        <>
            <div className='p-4 h_100vh'>
                <div className='notification_header'>
                    <h1 className='britti_medium fs_24 mb-0'>Chats</h1>
                    <Link to={'/notification'}>
                        <button className='noti_icon'>
                            <RiNotification3Line className='h-[20px] w-[20px] text-[#4A8DFF]' />
                        </button>
                    </Link>
                </div>

                <div className='mx-auto mb-2 mt-4'>
                    <div className="flex gap-3 items-center w-full">
                        <div className='flex justify-center w-full'>
                            <div className='bg-[#F5F7FA] rounded-[13px] p-1 pickup_group two_btn_group w-full'>
                                <div className='d-flex position-relative'>
                                    <button
                                        className={`pickup_btn ${chatType === 0 ? 'active' : ''}`}
                                        onClick={() => setChatType(0)}
                                    >
                                        General
                                    </button>
                                    <button
                                        className={`pickup_btn ${chatType === 1 ? 'active' : ''}`}
                                        onClick={() => setChatType(1)}
                                    >
                                        Private
                                    </button>
                                    <div className='sliding-background'></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {chatType === 0 ?
                    <>
                        {checkInStatus ? <>
                            <div className='w-full mt-5 mb-4'>
                                <h1 className='text-center fs_16 britti_bold'>You're Checked In</h1>
                                <span className='txt_grey mx-auto fs_14 flex gap-2 items-center justify-center w-full'><RiRecordCircleLine className='text-[#1FC16B]' /><span className='text-clamp-1 capitalize'>{checkInData?.checkInType} - {checkInData?.location?.name}</span> </span>
                            </div>

                            <div className='checkInGroup'>
                                <div className='flex items-start justify-between'>
                                    <div>
                                        <h1 className='britti_medium fs_16'>{checkInData?.location?.name}</h1>
                                        <span className='txt_grey capitalize'>{checkInData?.checkInType} Check-In</span>
                                    </div>
                                    <RiMapPinLine className='text-[#4A8DFF] w-[19px]' />
                                </div>
                                {groupDetails?.users && (
                                    <div className='flex items-center mt-2 mb-3 justify-between'>
                                        <span className='txt_grey fs_14'>{groupDetails?.message ?? groupDetails?.users?.length > 1 ? <>You and {groupDetails.users.length} Hangers are here</> : <>Only 1 Person in this chat</>}</span>
                                        <div className="hangGroup">
                                            {groupDetails.users.slice(0, 6).map((value, idx) => (
                                                <img src={value} key={idx} alt="" />
                                            ))}
                                            {groupDetails.users.length > 6 && (
                                                <div className="count-indicator">+{groupDetails.users.length - 6}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <button className={`py-[12px] britti_medium bg-[#4A8DFF] text-white fs_14 w-100 rounded-[16px] ${groupDetails?.message ? "mt-3" : ""}`} onClick={() => joinConversation()}>{groupDetails?.message ?? <>Join Chat</>}</button>
                            </div>

                        </> : <>
                            <div className='flex items-center gap-[12px] justify-center flex-col h-[69vh]'>
                                <img src={LocationIcon} className='w-[96px] h-[96px]' alt="" />
                                <h1 className='britti_medium fs_24 mb-0'>Join the Conversation</h1>
                                <span className='text-center txt_grey fs_16'>
                                    Check in to a location to unlock group chat with others nearby.
                                </span>
                                <div className={`border border-[#E1E4EA] mt-3 rounded-[16px] flex gap-2 items-center py-[8px] px-[14px] bg-[#F5F7FA] ${locationError ? 'txt_red' : 'txt_primary'}`}>
                                    <RiMapPinLine />
                                    <span className="cursor-pointer" onClick={getCurrentLocation}>
                                        {currentLocation}
                                    </span>
                                    {locationError && (
                                        <button
                                            onClick={getCurrentLocation}
                                            className="text-xs underline ml-2 text-blue-500"
                                        >
                                            Retry
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => showCheckIn()}
                                    className="primary_btn px-5 rounded-[16px] mt-4"
                                >
                                    Check In Now
                                </button>
                            </div>
                        </>}
                    </>
                    :
                    <><PersonalChatList /></>
                }
            </div>

            <FooterHome />
            <CheckIn show={checkInDrawer} hide={hideCheckIn} />
        </>
    )
}

export default Chat