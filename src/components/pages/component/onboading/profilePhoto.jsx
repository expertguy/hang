import React, { useState } from 'react'
import { User } from '../../../icons/icons'
import { useSelector } from 'react-redux';
import ApiFunction from '../../../../utils/api/apiFuntions';
import { decryptData } from '../../../../utils/api/encrypted';
import { Spinner } from 'react-bootstrap';

const ProfilePhoto = ({ setStep }) => {
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [upoadedImg, setUploadedImg] = useState('');
    const visibility = useSelector(state => state?.onboading?.visibility);
    const interests = useSelector(state => state?.onboading?.interests);
    const languages = useSelector(state => state?.onboading?.languages);
    const userTokenEncrypted = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(userTokenEncrypted);
    const { post } = ApiFunction();


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

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            imageUrlUplad(file);
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleContinue = async () => {
        const data = new FormData();
        data?.append('type', 'update_data');
        data?.append('id', userToken);
        data?.append('table_name', 'users');
        data?.append('visibility', visibility);
        data?.append('languages', JSON.stringify(languages));
        data?.append('interests', JSON.stringify(interests));
        if (upoadedImg) {
            data?.append('image', upoadedImg);
        }

        setLoading(true);
        await post('',data)
        .then(response => {
            if(response){
                console.log("the response is",response);
            }
        })
        .catch(err => {
            console.log("there is an error uploading onboading Data => ",upoadedImg);
        })
        .finally(() => {
        setLoading(false);
        setStep();
        })

    }

    return (
        <>
            <div className='p-[35px] h_90vh flex items-center justify-between flex-col'>
                <div className='flex h_65vh px-4 items-center justify-center h-full w-full flex-col'>
                    <div className='h-[120px] w-[120px] relative p-2 object-contain bg_avatar rounded-full mb-3'>
                        {profileImage ? (
                            <img
                                src={profileImage}
                                className='w-full h-full rounded-full object-cover'
                                alt="Profile"
                            />
                        ) : (
                            <img
                                src={User}
                                className='mx-auto bottom-0 left-0 absolute'
                                alt="Default User"
                            />
                        )}
                    </div>
                    <h1 className='britti_medium fs_24'>Profile Photo</h1>
                    <span className='txt_grey fs_16 text-center'>You can use your LinkedIn photo or
                        upload a new one.</span>
                    <label className='transparent_btn px-5 mt-4 cursor-pointer'>
                        {loading ? <><Spinner animation="border" className='mx-auto' variant="primary" /></> : <>
                            Upload
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </>}
                    </label>
                </div>
                <button onClick={() => handleContinue()} className='primary_btn w-full rounded-[15px] mt-5'>
                    {loading ? <><Spinner animation="border" className='mx-auto' variant="light" /></> : "Continue"}

                </button>
            </div>
        </>
    )
}

export default ProfilePhoto