import React, { useState, useEffect } from 'react'
import { Offcanvas, Spinner } from 'react-bootstrap'
import { RiCloseLine } from 'react-icons/ri'
import { CheckOutIcon, Startbucks } from '../../../icons/icons'
import { useDispatch, useSelector } from 'react-redux'
import { setCheckInData, setCheckInStatus } from '../../../redux/appDataSlice'
import { decryptData } from '../../../../utils/api/encrypted'
import ApiFunction from '../../../../utils/api/apiFuntions'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { RiInformation2Line } from '@remixicon/react'

const CheckOut = ({ show, hide, successDrawer }) => {
    
    const [loading, setLoading] = useState(false);
    const [placeImageUrl, setPlaceImageUrl] = useState(Startbucks);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    const CHECKIN_DATA_KEY = 'checkin_data_persistent';
    const CHECKIN_STATUS_KEY = 'checkin_status_persistent';

    const removeFromLocalStorage = (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    };

    const dispatch = useDispatch();
    const RemainingTime = useSelector(state => state.appData?.checkInTime);
    const checkInData = useSelector(state => state?.appData?.checkInData);
    const place_id = checkInData?.place_id;
    const { post } = ApiFunction();
    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);

    // Fetch place image when component mounts or place_id changes
    useEffect(() => {
        const fetchPlaceImage = async () => {
            // Reset to default image first
            setPlaceImageUrl(Startbucks);
            setImageError(false);

            // If no place_id or Google Maps not loaded, use fallback
            if (!place_id || !window.google || !window.google.maps || !window.google.maps.places) {
                return;
            }

            setImageLoading(true);

            try {
                // Create a dummy map for PlacesService
                const mapDiv = document.createElement('div');
                const map = new window.google.maps.Map(mapDiv);
                const service = new window.google.maps.places.PlacesService(map);

                // Request place details with photos
                const request = {
                    placeId: place_id,
                    fields: ['photos', 'name']
                };

                service.getDetails(request, (place, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        if (place.photos && place.photos.length > 0) {
                            // Get the first photo with a reasonable size
                            const photoUrl = place.photos[0].getUrl({
                                maxWidth: 200,
                                maxHeight: 200
                            });
                            setPlaceImageUrl(photoUrl);
                        } else {
                            // No photos available, keep default
                            console.log('No photos available for place:', place_id);
                        }
                    } else {
                        // API error, keep default
                        console.warn(`Failed to fetch place details for ${place_id}:`, status);
                    }
                    setImageLoading(false);
                });
            } catch (error) {
                console.error('Error fetching place image:', error);
                setImageLoading(false);
            }
        };

        // Only fetch if we have a place_id and it's not 'current'
        if (place_id && place_id !== 'current') {
            fetchPlaceImage();
        }
    }, [place_id]);

    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
            setPlaceImageUrl(Startbucks);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        const currentTime = new Date().toISOString();
        const apiData = new FormData();
        apiData.append('type', 'update_data');
        apiData.append('user_id', userToken);
        apiData.append('id', checkInData?.checkInId || '');
        apiData.append('table_name', 'check_in');
        apiData.append('checkout_time', currentTime);
        apiData.append('checkout_type', 'user');

        await post('', apiData)
            .then(res => {
                if (res?.result) {
                    dispatch(setCheckInStatus(false));
                    dispatch(setCheckInData({}));

                    // Clear localStorage coordinates when checking out
                    localStorage.removeItem('checkInLat');
                    localStorage.removeItem('checkInLong');
                    localStorage.removeItem('checkInData');
                    // Clear other check-in data
                    removeFromLocalStorage(CHECKIN_DATA_KEY);
                    removeFromLocalStorage(CHECKIN_STATUS_KEY);
                    successDrawer();
                    toast.success('Checked in successfully!', {
                icon: <Link to="/notification"><RiInformation2Line /></Link>
            });
                }
            })
            .catch(err => {
                console.log("there is an error completing the checkout =>", err);
            })
            .finally(() => {
                setLoading(false);
                hide();
            });
    }

    return (
        <>
            <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={show} placement='bottom' onHide={hide} className="offcanvas-bottom offcanvasBG">
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>Check-out</h1>
                    <RiCloseLine onClick={hide} className='w-[24px] h-[24px] absolute right-5' />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className=' flex flex-col items-center pt-[20px] h-100 sm:px-[15px]'>
                        <div className=''>
                            <img src={CheckOutIcon} className='mx-auto object-cover h-[96px] w-[96px] bg-[#ACCBFF] rounded-full' alt="" />
                        </div>
                        <div className='mt-3'>
                            <h1 className='britti_medium fs_24 text-center'>Are you sure?</h1>
                            <h2 className='txt_grey fs_16 mt-2 text-center'>Ending your check-in will remove your visibility from the map and general city chat. </h2>
                            <h3 className='mt-4 txt_grey fs_16 text-center'>You can always check in again later.</h3>
                        </div>

                        <div className='w-full mt-[18px]'>
                            <span className='text-start text-[#525866] fs_12'>Check-In Summary</span>
                            <div className='checkIn_Detail_card'>
                                <div className="relative">
                                    <img
                                        src={placeImageUrl}
                                        className='rounded-[12px] w-[48px] h-[48px] object-cover'
                                        alt={checkInData?.location?.name || 'Place image'}
                                        onError={handleImageError}
                                    />
                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-[12px]">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className='fs_16 britti_bold'>{checkInData?.checkInType} - {checkInData?.location?.name}</h1>
                                    <detail className='txt_grey fs_14'>{RemainingTime} left {(checkInData?.status_text) ? <>- {checkInData?.status_text}</> : ""}</detail>
                                </div>
                            </div>
                        </div>

                        <div className="btnGroup grid grid-cols-1 w-full gap-2 mt-4">
                            <button className='primary_btn w-full rounded-[12px]' onClick={() => handleCheckOut()}>
                                {loading ? <><Spinner animation="border" variant="light" /></> : <>Yes, End Check-In</>}
                            </button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default CheckOut