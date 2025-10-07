/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Linkdin, logoDark } from '../../../icons/icons'
import { useDispatch, useSelector } from 'react-redux'
import { decryptData } from '../../../../utils/api/encrypted'
import CustomMultiSelect from '../formElements/customMultiSelect'
import ApiFunction from '../../../../utils/api/apiFuntions'
import CustomSelect from '../formElements/customSelect'
import { setOnboadingProfileData } from '../../../redux/onboadingDataSlice'

const OnboadingReview = ({ setStep }) => {

    const prevSelectedData = useSelector(state => state?.onboading?.visibility);
    const encryptedData = useSelector(state => state.appData?.userData);
    const userData = decryptData(encryptedData);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [industries, setIndustires] = useState([]);
    const { post } = ApiFunction();

    const prevData = useSelector(state => state?.onboading?.OnboadingProfile);

    // Gender options data
    const genderOptions = [
        { id: 1, name: 'Male', value: 'male' },
        { id: 2, name: 'Female', value: 'female' },
        { id: 3, name: 'Other', value: 'other' }
    ];

    // Separate useEffect to restore data after industries are loaded
    useEffect(() => {
        if (prevData && industries.length > 0) {
            setTitle(prevData?.designation);
            setCompany(prevData?.company);
            setSelectedLanguages(prevData?.languages);
            
            // Find the full industry object that matches the stored name
            if (prevData?.industries) {
                const matchingIndustry = industries.find(
                    industry => industry.name === prevData.industries
                );
                if (matchingIndustry) {
                    setSelectedIndustry(matchingIndustry);
                }
            }

            // Restore gender if exists
            if (prevData?.gender) {
                const matchingGender = genderOptions.find(
                    gender => gender.value === prevData.gender
                );
                if (matchingGender) {
                    setSelectedGender(matchingGender);
                }
            }
        }
    }, [prevData, industries])

    useEffect(() => {
        const data = {
            'type': 'get_data',
            'table_name': 'industries'
        }

        const getIndustries = async () => {
            await post('', data)
                .then(response => {
                    if (response) {
                        setIndustires(response?.data);
                    }
                })
                .catch(err => {
                    console.log("there is an error fetching the industries", err);
                })
        }
        getIndustries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const languages = useSelector((state) => state.appData?.languages);

    const handleLanguageChange = (newSelectedLanguageNames) => {
        setSelectedLanguages(newSelectedLanguageNames);
    };

    const handleIndustryChange = (selectedIndustryItem) => {
        setSelectedIndustry(selectedIndustryItem);
    };

    const handleGenderChange = (selectedGenderItem) => {
        setSelectedGender(selectedGenderItem);
    };

    const dispatch = useDispatch();

    const handleContinue = () => {
        // Collect all the onboarding data
        const onboardingData = {
            designation: title,
            company: company,
            industries: selectedIndustry?.name,
            languages: selectedLanguages,
            gender: selectedGender?.value, // Store the gender value
        };

        // Dispatch the collected data to Redux store
        dispatch(setOnboadingProfileData(onboardingData));

        setStep(2); // or whatever the next step identifier is
    };

    // Validation function to check if all required fields are filled
    const isFormValid = () => {
        return title?.trim() !== '' &&
            company?.trim() !== '' &&
            selectedIndustry !== null &&
            selectedLanguages?.length > 0 &&
            selectedGender !== null; // Gender is now required
    };

    useEffect(() => {
        // Any side effects based on prevSelectedData
    }, [prevSelectedData])

    return (
        <>
            <div className='px-[26px] py-[35px] h_90vh flex items-center justify-between flex-col'>
                <div className='flex items-center justify-between w-full flex-col'>
                    <img src={logoDark} className='w-[96px] h-[96px] mb-3' alt="" />
                    <h1 className='britti_medium fs_24'>Welcome to Hang!</h1>
                    <span className='txt_grey fs_16 text-center'>We've imported your professional info from LinkedIn. Please review before continuing.</span>
                    <div className='mt-4 w-full flex flex-col gap-[10px]'>
                        <div className='flex bg_weak py-4 px-3 rounded-[16px] items-center gap-3 mb-2 w-full'>
                            <div className='profile_Image'>
                                <img src={userData?.image} className='' alt="" />
                                <img src={Linkdin} className='linkdin' alt="" />
                            </div>
                            <div>
                                <h2 className='fs_16 britti_bold mb-1'>{userData?.name}</h2>
                                <span className='fs_14 txt_grey'>{title} - {company}</span>
                            </div>
                        </div>
                        <div>
                            <label className='mb-[3px]' htmlFor="">Your Title / Position</label>
                            <div className='customInput'>
                                <input
                                    type="text"
                                    placeholder='e.g., "Software Engineer"'
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title}
                                    name=""
                                    id=""
                                />
                            </div>
                        </div>
                        <div>
                            <label className='mb-[3px]' htmlFor="">Your Company / Organization</label>
                            <div className='customInput'>
                                <input
                                    type="text"
                                    placeholder='e.g., "Tech Company Inc."'
                                    onChange={(e) => setCompany(e.target.value)}
                                    value={company}
                                    name=""
                                    id=""
                                />
                            </div>
                        </div>
                        <div>
                            <label className='mb-[3px]' htmlFor="">Industry</label>
                            <div className=''>
                                <CustomSelect
                                    data={industries}
                                    selectedItem={selectedIndustry}
                                    onSelectionChange={handleIndustryChange}
                                    placeholder="Select Industry"
                                    searchPlaceholder="Search industries..."
                                    displayKey="name"
                                    searchKey="name"
                                    iconKey="flag"
                                    showIcon={true}
                                    maxHeight="300px"
                                    emptyMessage="No industries found"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className='mb-[3px]' htmlFor="">Gender</label>
                            <div className=''>
                                <CustomSelect
                                    data={genderOptions}
                                    selectedItem={selectedGender}
                                    onSelectionChange={handleGenderChange}
                                    placeholder="Select Gender"
                                    searchPlaceholder="Search..."
                                    displayKey="name"
                                    searchKey="name"
                                    showIcon={false}
                                    maxHeight="250px"
                                    emptyMessage="No options found"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div>
                            <label className='mb-[3px]' htmlFor="">Select languages you speak</label>
                            <div className=''>
                                <CustomMultiSelect
                                    data={languages}
                                    selectedItems={selectedLanguages}
                                    onSelectionChange={handleLanguageChange}
                                    placeholder="Add Languages..."
                                    searchPlaceholder="Search languages..."
                                    displayKey="name"
                                    searchKey="name"
                                    iconKey="flag"
                                    showIcon={true}
                                    showSelectedTags={true}
                                    multiSelect={true}
                                    maxHeight="300px"
                                    emptyMessage="No languages found"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => handleContinue()}
                    disabled={!isFormValid()}
                    className={`primary_btn w-full rounded-[15px] mt-5 ${!isFormValid() ? "opacity-50" : ""}`}
                >
                    Continue
                </button>
            </div>
        </>
    )
}

export default OnboadingReview