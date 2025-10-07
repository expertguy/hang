/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { RiArrowLeftLine } from 'react-icons/ri'
import FooterHome from './footerHome'
import { Link } from 'react-router-dom'
import ApiFunction from '../../utils/api/apiFuntions'
import DOMPurify from "dompurify";

const PrivacyPolicy = () => {
    const data = new FormData();
    const [loading, setLoading] = useState(false);
    const [privacy, setPrivacy] = useState('');
    data.append('type', 'get_data');
    data.append('table_name', 'preferences');
    data.append('id', 1);

    const { post } = ApiFunction();

    useEffect(() => {
        const getPreferences = async () => {
            setLoading(true);
            await post('', data)
                .then(response => {
                    console.log("the response ", response.data[0]);
                    if (response?.data) {
                        setPrivacy(response?.data[0]?.privacy);
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

    return (
        <>
            {/* Method 1: Using style tag within component */}
            <style>
                {`
                    .terms-content p {
                        color: black !important;
                    }
                `}
            </style>

            <div className=' h_100vh'>
                <div className='chatHeader p-4 pb-3'>
                    <Link to={'/setting'}>
                        <RiArrowLeftLine className='w-[20px] h-[20px]' />
                    </Link>
                    <div>
                        <h1 className='britti_bold fs_18 mb-0 ms-2 text-[#0E121B]'>Privacy Policy</h1>
                    </div>
                </div>

                <div className='main_body p-4 overflow-y-auto'>
                    <div
                        className="terms-content"
                        dangerouslySetInnerHTML={{ __html: (privacy) }}
                    />
                </div>
            </div>
            <FooterHome />
        </>
    )
}

export default PrivacyPolicy;
