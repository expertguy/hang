import { RiArrowLeftLine } from '@remixicon/react'
import React, { useEffect, useState } from 'react'
import { ContactIcon } from '../../../icons/icons'
import { Link } from 'react-router-dom';
import ApiFunction from '../../../../utils/api/apiFuntions';
import { useSelector } from 'react-redux';
import { decryptData } from '../../../../utils/api/encrypted';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

const Contact = () => {

    // eslint-disable-next-line no-unused-vars
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [disabled, setDisabled] = useState(true);
    const { post } = ApiFunction();
    const encryptedToken = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(encryptedToken);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (subject === '' || message === '') {
            setDisabled(true);
        }else{
            setDisabled(false);

        }
    }, [message, subject])

    const submit = async () => {
        setLoading(true);
        const data = {
            type: 'add_data',
            table_name: 'contact_us',
            user_id: userToken,
            subject: subject,
            message: message
        }

        await post('', data)
            .then(res => {
                if (res.result) {
toast.success("message sent Successfully");
                }
            })
            .catch(err => {
                console.log("there is an error sending the message", err);
            })
            .finally(() => {
                setLoading(false);
            })


    }



    return (
        <>
            <div className="p-4 border-b border-[#E1E4EA] relative">
                <Link to={'/setting'} className='absolute top-[23px] left-[20px] z-10'>
                    <RiArrowLeftLine className='w-[24px]  h-[24px]' />
                </Link>
                <h1 className='fs_18 mb-0 text-center britti relative top-[3px]'>Hep and Support</h1>

            </div>
            <div className='p-4 main_body'>
                <div className=' flex flex-col items-center justify-evenly h-100 px-[15px]'>
                    <div className=' relative p-2'>
                        <img src={ContactIcon} className='h-[96px] w-[96px] rounded-full' alt="" />
                    </div>
                    <div>
                        <h1 className='britti_medium fs_24 text-center'>Contact Us</h1>
                        <h2 className='txt_grey fs_16 mt-2 text-center britti_light'>We'd love to hear from you. Please fill out this form.</h2>
                    </div>
                </div>
                <div className='mt-4'>
                    <label htmlFor="" className='mb-2 fs_12 text-[#0E121B] britti'>Subject</label>
                    <div className='customInput '>
                        <input type="text" placeholder='Type a message...' onChange={(e) => setSubject(e.target.value)} name="" id="" />
                    </div>
                </div>
                <div className='mt-2 mb-4'>
                    <label htmlFor="" className='fs_12 text-[#0E121B] britti mb-2'>Your Message</label>
                    <div className='customInput min-h-[195px]'>
                        <textarea className='' placeholder='Type a message...' onChange={(e) => setMessage(e.target.value)} name="" id="" >

                        </textarea>
                    </div>
                </div>

                <button className={`primary_btn w-full rounded-xl mt-4 ${disabled ? "opacity-50" : ""}`} disabled={disabled} onClick={() => submit()}>{loading ? <><Spinner animation="border" variant="light" /></> : <>Send Message</>}</button>
            </div>
        </>
    )
}

export default Contact
