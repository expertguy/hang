/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { RiArrowLeftLine } from '@remixicon/react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { decryptData, encryptData } from '../../../../utils/api/encrypted';
import ApiFunction from '../../../../utils/api/apiFuntions';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { setUserData } from '../../../redux/appDataSlice';
import CustomMultiSelect from '../formElements/customMultiSelect';
import CustomSelect from '../formElements/customSelect';

const Profile = () => {
    const encryptedData = useSelector(state => state?.appData?.userData);
    const userData = decryptData(encryptedData);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [profileImage, setProfileImage] = useState(null);
    const [upoadedImg, setUploadedImg] = useState('');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const { post } = ApiFunction();
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [fullname, setFullname] = useState('');
    const [bio, setBio] = useState('');
    const userTokenEncrypted = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(userTokenEncrypted);
    const languages = useSelector((state) => state.appData?.languages);
    const [industries, setIndustires] = useState([]);

    const handleLanguageChange = (newSelectedLanguageNames) => {
        setSelectedLanguages(newSelectedLanguageNames);
    };

    const handleIndustryChange = (selectedIndustryItem) => {
        setSelectedIndustry(selectedIndustryItem);
    };

    // Helper function to safely parse JSON strings with escaped quotes
    const safeJsonParse = (jsonString, fallback = []) => {
        if (!jsonString) return fallback;

        try {
            // First, try normal JSON.parse
            return JSON.parse(jsonString);
        } catch (error) {
            try {
                // If that fails, try to fix the escaped quotes
                // eslint-disable-next-line no-useless-escape
                const fixedString = jsonString.replace(/\\\"/g, '"');
                return JSON.parse(fixedString);
            } catch (secondError) {
                try {
                    // Last resort: try to remove backslashes entirely
                    const cleanedString = jsonString.replace(/\\/g, '');
                    return JSON.parse(cleanedString);
                } catch (finalError) {
                    console.warn('Could not parse JSON string:', jsonString, finalError);
                    return fallback;
                }
            }
        }
    };

    const fetchUserData = async () => {
        const userData = {
            table_name: 'users',
            type: 'get_data',
            id: userToken
        }

        await post('', userData)
            .then(res => {
                if (res?.data[0]) {
                    const resData = res?.data[0];
                    const dataEncrypt = encryptData(resData);
                    dispatch(setUserData(dataEncrypt));
                }
            })
            .catch(err => {
                console.log("the error is ", err);
            })
            .finally(() => {

            })
    }

    useEffect(() => {
        fetchUserData();
    }, [])


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

    const dispatch = useDispatch();

    useEffect(() => {
        if (userData) {
            setFullname(userData?.name || '');
            setBio(userData?.about || '');
            setTitle(userData?.designation || '');
            setCompany(userData?.company || '');

            // Handle industry - find the full industry object from the industries array
            if (userData?.industry) {
                if (typeof userData.industry === 'string') {
                    // If industry is stored as string, find the matching object
                    const industryObj = industries.find(ind =>
                        ind.name === userData.industry ||
                        ind.id === userData.industry
                    );
                    setSelectedIndustry(industryObj || { name: userData.industry });
                } else {
                    // If industry is already an object
                    setSelectedIndustry(userData.industry);
                }
            } else {
                setSelectedIndustry(null);
            }

            // Use the safe JSON parse function for languages
            const parsedLanguages = safeJsonParse(userData?.languages, []);
            setSelectedLanguages(parsedLanguages);
        }
    }, []) // Added industries as dependency

    const imageUrlUplad = async (fileData) => {
        const form = new FormData();
        form.append('type', 'upload_data');
        form.append('user_id', userToken);
        form.append('file', fileData);
        setLoading(true);
        await post('', form)
            .then(response => {
                if (response?.result) {
                    setUploadedImg(response?.url);
                }
            })
            .catch(err => {
                console.log("there is an error uploading the image the error is=>", err);
            })
            .finally(() => {
                setLoading(false);
            })

    }

    const UpdateProfile = async () => {
        const data = new FormData();
        data?.append('type', 'update_data');
        data?.append('id', userToken);
        data?.append('table_name', 'users');
        data?.append('about', bio);
        data?.append('name', fullname);
        data?.append('designation', title);
        data?.append('company', company);

        // Add languages to the form data
        if (selectedLanguages && selectedLanguages.length > 0) {
            data?.append('languages', JSON.stringify(selectedLanguages));
        } else {
            data?.append('languages', JSON.stringify([]));
        }

        // Add industry to the form data
        if (selectedIndustry) {
            // Send either the industry name or ID based on your backend requirements
            data?.append('industry', selectedIndustry.name || selectedIndustry);
        } else {
            data?.append('industry', '');
        }

        if (upoadedImg) {
            data?.append('image', upoadedImg);
        }

        console.log("Sending to backend - Languages:", selectedLanguages, "Industry:", selectedIndustry);

        setLoading(true);
        await post('', data)
            .then(response => {
                if (response?.result) {
                    fetchUserData();
                    toast.success('Profile Updated Successfully')
                }
            })
            .catch(err => {
                console.log("there is an error uploading onboading Data => ", err);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            imageUrlUplad(file);
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    return (
        <>
            <div className="p-4 border-b border-[#E1E4EA] relative">
                <Link to={'/setting'} className='absolute top-[23px] left-[20px] z-10'>
                    <RiArrowLeftLine className='w-[24px]  h-[24px]' />
                </Link>
                <h1 className='fs_18 mb-0 text-center britti relative top-[3px]'>Edit Profile</h1>
            </div>
            <div className='p-4 main_body'>
                <div className=' flex flex-col items-center justify-evenly h-100 px-[15px]'>
                    <div className=' relative p-2'>
                        <img src={profileImage ?? userData?.image} className='h-[120px] w-[120px] bg-[#ACCBFF] rounded-full object-cover object-top' alt="" />
                    </div>
                    <div>
                        <h1 className='britti_medium fs_24 text-center'>Profile Photo</h1>
                        <h2 className='txt_grey max-w-[234px] fs_16 mt-2 text-center britti_light'>You can use your LinkedIn photo or
                            upload a new one.</h2>
                        <label className='transparent_btn px-5 mx-auto w-min mt-4 cursor-pointer'>
                            {loading ? <><Spinner animation="border" variant="light" /></> : <>Upload</>}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                </div>
                <div className='mt-4'>
                    <label htmlFor="" className='mb-2 fs_12 text-[#0E121B] britti'>Full Name</label>
                    <div className='customInput '>
                        <input type="text" value={fullname} placeholder='Type a message...' disabled readOnly={true} name="" id="" />
                    </div>
                </div>
                <div className='mt-2'>
                    <label htmlFor="" className='fs_12 text-[#0E121B] britti mb-2'>Bio</label>
                    <div className='customInput min-h-[95px]'>
                        <textarea className='' value={bio} placeholder='Type a message...' onChange={(e) => setBio(e.target.value)} name="" id="" >

                        </textarea>
                    </div>
                </div>
                <div className='mt-2'>
                    <label htmlFor="" className='fs_12 text-[#0E121B] britti mb-2'>Company Name</label>
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
                <div className='mt-2'>
                    <label htmlFor="" className='fs_12 text-[#0E121B] britti mb-2'>Title</label>
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

                <div className='mt-2'>
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
                <div className='mt-2 mb-4'>
                    <label className='mb-[3px]' htmlFor="">Select languages you speak</label>
                    <div className=''>
                        <CustomMultiSelect
                            data={languages || []}
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

                <button onClick={() => UpdateProfile()} disabled={loading} className='primary_btn w-full rounded-xl mt-4'>{loading ? <><Spinner size='sm' animation="border" variant="light" /></> : "Save Changes"}</button>
            </div>
        </>
    )
}

export default Profile