/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { InterestsIcon } from '../../../icons/icons'
import ApiFunction from '../../../../utils/api/apiFuntions';
import { useDispatch, useSelector } from 'react-redux';
import { setInterestData } from '../../../redux/onboadingDataSlice';
import { Spinner } from 'react-bootstrap';
import { decryptData, encryptData } from '../../../../utils/api/encrypted';
import { setUserData } from '../../../redux/appDataSlice';

const Interests = ({ setStep }) => {

    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const user_id = decryptData(encryptedToken);
    const prevSelectedData = useSelector(state => state?.onboading?.interests);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [interestsList, setInterestsList] = useState(null);
    const { post } = ApiFunction();
    const dispatch = useDispatch();
    const data = new FormData();
    data.append('type', 'get_data');
    data.append('table_name', 'interests');



    useEffect(() => {
        if (prevSelectedData && prevSelectedData?.length > 0) {
            setSelectedInterests(prevSelectedData);
        }
    }, [prevSelectedData])

    useEffect(() => {
        const getInterestsList = async () => {
            setLoading(true);
            await post('', data)
                .then(response => {
                    if (response) {
                        setInterestsList(response?.data);
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

        getInterestsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheckboxChange = (event, interest) => {
        if (event.target.checked) {
            setSelectedInterests([...selectedInterests, interest]);
            // if (selectedInterests?.length < 5) {
            // } else {
            //     // Prevent checking more than 5 by unchecking the checkbox
            //     event.target.checked = false;
            // }
        } else {
            setSelectedInterests(selectedInterests?.filter(item => item !== interest));
        }
    };

    const profileData = useSelector(state => state?.onboading?.OnboadingProfile);

    const handleContinue = async () => {
        setSubmitting(true);
        
        try {
            // Prepare the data structure with arrays converted to JSON strings
            const formData = new FormData();
            
            // Add basic fields
            formData.append('type', 'update_data'); // or whatever your endpoint expects
            formData.append('table_name', 'users');
            formData.append('id', user_id); 
            formData.append('designation', profileData?.designation || '');
            formData.append('company', profileData?.company || '');
            formData.append('industry', profileData?.industries || '');
            formData.append('gender', profileData?.gender || '');
            
            // Convert arrays to JSON strings
            const languagesJson = JSON.stringify(profileData?.languages || []);
            const interestsJson = JSON.stringify(selectedInterests);
            
            formData.append('languages', languagesJson);
            formData.append('interests', interestsJson);

            // Alternative: If your API expects regular JSON (not FormData)
            const jsonPayload = {
                type: 'submit_onboarding',
                designation: profileData?.designation || '',
                company: profileData?.userInfo?.company || '',
                industry: profileData?.selectedIndustry?.name || '',
                languages: JSON.stringify(profileData?.selectedLanguages || []),
                interests: JSON.stringify(selectedInterests)
            };

            // Make the API call
            await post('', formData) // Use formData for FormData approach
            // OR
            // await post('', jsonPayload) // Use jsonPayload for JSON approach
                .then(response => {
                    if (response) {
                        
                        // Store interests in Redux
                        dispatch(setInterestData(selectedInterests));
                        localStorage.setItem('onboading_completed',true);
                        // Move to next step
                        setStep(); // or setStep('next_step_name')
                    } else {
                        console.log("Failed to submit onboarding data");
                    }
                })
                .catch(err => {
                    console.log("Error submitting onboarding data:", err);
                })
                .finally(() => {
                    setSubmitting(false);
                });

        } catch (error) {
            console.log("Error in handleContinue:", error);
            setSubmitting(false);
        }
    }
    const isMinimumSelected = selectedInterests?.length >= 5;

    return (
        <>
            <div className='p-[35px] h_90vh flex items-center justify-between w-full flex-col'>
                <div className='flex items-center justify-between w-full flex-col'>
                    <img src={InterestsIcon} className='w-24 h-24 mb-3' alt="Interests Icon" />
                    <h1 className='britti_medium fs_24'>Your Interests</h1>
                    <span className='txt_grey fs_16'>Select at least 5 interests ({selectedInterests?.length}/5 selected).</span>
                    {loading ? (
                        <div className='h_50vh flex items-center justify-center'>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <div className='w-full mt-4 interestsGroup'>
                            {interestsList?.map((data, index) => (
                                <div className="interestItem" key={index}>
                                    <div className={selectedInterests?.includes(data?.name) ? "interest" : "flex items-center justify-center h-100 px-[12px] border-1 border-transparent"}>
                                        {data?.name}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedInterests?.includes(data?.name)}
                                        onChange={(e) => handleCheckboxChange(e, data?.name)}
                                        disabled={submitting}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => handleContinue()}
                    disabled={!isMinimumSelected || submitting}
                    className={`primary_btn w-full rounded-[15px] mt-5 ${(!isMinimumSelected || submitting) ? 'opacity-50' : ''}`}
                >
                    {submitting ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Submitting...
                        </>
                    ) : (
                        'Continue'
                    )}
                </button>
            </div>
        </>
    )
}

export default Interests