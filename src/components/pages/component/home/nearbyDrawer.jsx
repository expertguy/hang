/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Offcanvas, Spinner } from 'react-bootstrap'
import { RiCloseLine } from 'react-icons/ri'
import { Startbucks } from '../../../icons/icons'
import ApiFunction from '../../../../utils/api/apiFuntions'
import { decryptData } from '../../../../utils/api/encrypted'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import getPlaceImageUrls, { initGooglePlaces } from '../../../../utils/location/googleImage'

// Move this to environment variables (.env file)
// REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || 'AIzaSyAP-8oI9lGS6a4iXlCdSD7bZDyz_D-FGAs';

const NearbyDrawer = ({ show, hide, userData }) => {
    const tags = userData?.tags || [];
    const [place_id, setPlaceId] = useState('');
    const [placeImage, setPlaceImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [placesServiceReady, setPlacesServiceReady] = useState(false);
    const [initError, setInitError] = useState(null);
    const [interestsList, setInterestsList] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userInterest, setUserInterest] = useState(null);

    const visibleTags = showAll ? tags : tags.slice(0, 2);
    const hiddenTagsCount = tags.length - 2;
    const hiddenTags = tags.slice(2);
    const { post } = ApiFunction();

    // Initialize Google Places API when component mounts
    useEffect(() => {
        const initializePlaces = async () => {
            try {
                await initGooglePlaces(GOOGLE_PLACES_API_KEY);
                setPlacesServiceReady(true);
                setInitError(null);
            } catch (error) {
                setInitError(error.message);
                setPlacesServiceReady(false);
            }
        };

        if (GOOGLE_PLACES_API_KEY) {
            initializePlaces();
        } else {
            setInitError('API key not found');
        }
    }, []);

    // Extract place_id from userData
    useEffect(() => {
        if (userData?.check) {
            const extractedPlaceId = userData.check.place_id;

            if (extractedPlaceId && extractedPlaceId.trim() !== '') {
                setPlaceId(extractedPlaceId.trim());
            } else {
                setPlaceId('');
            }
        } else {
            setPlaceId('');
        }
    }, [userData]);

    // Fetch place image when conditions are met
    useEffect(() => {
        const fetchPlaceImage = async () => {

            if (!place_id) {
                return;
            }

            if (!placesServiceReady) {
                return;
            }

            if (initError) {
                return;
            }

            setImageLoading(true);

            try {
                const imageUrls = await getPlaceImageUrls(place_id);
                if (imageUrls && imageUrls.length > 0) {
                    setPlaceImage(imageUrls[0]);
                } else {
                    setPlaceImage(null);
                }
            } catch (error) {
                setPlaceImage(null);
            } finally {
                setImageLoading(false);
            }
        };

        fetchPlaceImage();
    }, [place_id, placesServiceReady, initError]);

    // Test place ID validation function
    const testPlaceId = (testId) => {
        // Google Place IDs typically start with specific prefixes
        const validPrefixes = ['ChIJ', 'EI', 'GhIJ'];
        const hasValidPrefix = validPrefixes.some(prefix => testId.startsWith(prefix));

        if (!hasValidPrefix) {
        } else {
        }

        return testId.length > 10;
    };

    // Test the current place_id
    useEffect(() => {
        if (place_id) {
            testPlaceId(place_id);
        }
    }, [place_id]);

    const filterInterest = () => {
        if (!userData || !interestsList) {
            return;
        }

        try {
            const jsonString = userData?.interests;

            if (!jsonString) {
                setUserInterest([]);
                return;
            }

            const cleanedString = jsonString.replace(/\\/g, '');
            const selectedInterestIds = JSON.parse(cleanedString);
            const filteredInterests = interestsList.filter(interest =>
                selectedInterestIds.includes(interest.id)
            );

            setUserInterest(filteredInterests);
        } catch (error) {
            console.error("Error parsing interests:", error);
            setUserInterest([]);
        }
    };

    useEffect(() => {
        const data = new FormData();
        data.append('type', 'get_data');
        data.append('table_name', 'interests');

        const getallInterest = async () => {
            setLoading(true);
            try {
                const response = await post('', data);
                if (response) {
                    setInterestsList(response?.data);
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        }

        getallInterest();
    }, []);

    useEffect(() => {
        filterInterest();
    }, [userData, interestsList]);

    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const navigate = useNavigate();

    const startMessage = async () => {
        const data = {
            type: "start_personal_conversation",
            user_id: userToken,
            other_user_id: userData?.id
        }
        setLoading(true);
        await post('', data)
            .then(res => {
                if (res?.result) {
                    const conversation_id = res?.conversation_id;
                    navigate(`/private/${conversation_id}`, { state: { otherUser: userData } });
                }
            })
            .catch(err => {
                console.log("the error in private message is", err);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    if (!userData) {
        return null;
    }

    return (
        <>
            <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={show} placement='bottom' onHide={hide} className="offcanvas-bottom offcanvasBG">
                <Offcanvas.Body>
                    <RiCloseLine onClick={hide} className='w-[32px] h-[32px] bg-[#F5F7FA] rounded-full cursor-pointer absolute p-[6px] right-5 top-[25px]' />
                    <div className=' flex flex-col items-center pt-[20px] h-100 sm:px-[15px]'>
                        <div className=''>
                            <img src={userData?.image} className='mx-auto object-cover h-[96px] w-[96px] bg-[#ACCBFF] rounded-full' alt="" />
                        </div>
                        <div className='mt-4'>
                            <h1 className='britti_medium fs_24 text-center'>{userData?.name}</h1>
                            <h2 className='txt_grey fs_16 mt-2 text-center'>{userData?.email}</h2>
                        </div>

                        {/* Display filtered interests */}
                        {userInterest && userInterest.length > 0 && (
                            <div className='w-full mt-3 interestsGroup items-center justify-center'>
                                {userInterest.map((interest, idx) => (
                                    <div key={interest.id} className="border border-[#E1E4EA] rounded-[12px] flex items-center justify-center px-[15px] py-[6px] text-sm font-medium text-gray-700">
                                        {interest.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className='w-full mt-3 interestsGroup items-center justify-center'>
                            {visibleTags.map((interest, idx) => (
                                <div key={idx} className="border border-[#E1E4EA] rounded-[12px] flex items-center justify-center px-[15px] py-[6px] text-sm font-medium text-gray-700">
                                    {interest}
                                </div>
                            ))}
                            {!showAll && hiddenTagsCount > 0 && (
                                <div
                                    onClick={() => setShowAll(true)}
                                    className="cursor-pointer border border-[#E1E4EA] bg-white rounded-[12px] px-[15px] py-[6px] text-sm font-medium text-gray-700"
                                >
                                    +{hiddenTagsCount}
                                </div>
                            )}

                            {showAll && hiddenTags.map((interest, idx) => (
                                <div key={`hidden-${idx}`} className="border border-[#E1E4EA] rounded-[12px] flex items-center justify-center px-[15px] py-[6px] text-sm font-medium text-gray-700">
                                    {interest}
                                </div>
                            ))}
                        </div>

                        <div className='w-full mt-[8px]'>
                            <span className='text-start text-[#525866] fs_12'>Checked In</span>
                            <div className='checkIn_Detail_card'>
                                {imageLoading ? (
                                    <div className='rounded-[12px] w-[48px] h-[48px] flex items-center justify-center bg-gray-200'>
                                        <Spinner size='sm' animation="border" />
                                    </div>
                                ) : (
                                    <img
                                        src={placeImage || Startbucks}
                                        className='rounded-[12px] w-[48px] h-[48px] object-cover'
                                        alt={userData?.check?.address || "Place"}
                                        onError={(e) => {
                                            e.target.src = Startbucks;
                                        }}
                                    />
                                )}
                                <div>
                                    <h1 className='fs_16 britti_bold'>{userData?.check?.place_name}</h1>
                                    <detail className='txt_grey fs_14'>{(userData?.check?.duration) / 60}h left {userData?.check?.status_text ? <>- {userData?.check?.status_text}</> : ""}</detail>
                                </div>
                            </div>
                        </div>

                        <div className="btnGroup grid grid-cols-1 w-full gap-2 mt-4">
                            {/* <button className='transparent_btn w-full rounded-[12px]'>View Profile</button> */}
                            <button onClick={() => startMessage()} className='primary_btn w-full rounded-[12px]' disabled={loading}>{loading ? <><Spinner size='sm' animation="border" variant="light" /></> : "Send Message"}</button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default NearbyDrawer