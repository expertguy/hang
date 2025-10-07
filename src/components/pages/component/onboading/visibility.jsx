import React, { useEffect, useState } from 'react'
import { VisibilityIcon } from '../../../icons/icons'
import { Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { setVisibilityData } from '../../../redux/onboadingDataSlice'


const options = [
    {
        heading: "Everyone",
        type: "everyone",
        para: "All users in your proximity.",

    },
    {
        heading: "Same industry",
        type: "industry",
        para: "Only users from your professional industry.",

    },
    {
        heading: "Similar interests",
        type: "interest",
        para: "Only users who share at least one interest.",

    },
]


const Visibility = ({ setStep }) => {

    const prevSelectedData = useSelector(state => state?.onboading?.visibility);
    const [visibility, setVisibility] = useState('');
    const dispatch = useDispatch();
    const handleContinue = () => {
        dispatch(setVisibilityData(visibility));
        setStep();
    }

    useEffect(() => {

        prevSelectedData ? setVisibility(prevSelectedData) : setVisibility('');

    }, [prevSelectedData])

    return (
        <>
            <div className='p-[35px] h_90vh flex items-center justify-between flex-col'>
                <div className='flex items-center justify-between w-full flex-col'>
                    <img src={VisibilityIcon} className='w-[96px] h-[96px] mb-3' alt="" />
                    <h1 className='britti_medium fs_24'>Set Your Visibility</h1>
                    <span className='txt_grey fs_16'>Control who can see your check-ins on the map.</span>
                    <div className='w-full mt-4 flex flex-col gap-[14px]'>
                        {options?.map((value, key) => (
                            <div onClick={() => setVisibility(value?.type)} key={key} className='visibility_option'>
                                <div>
                                    <h1 className='britti_bold fs_16'>{value?.heading}</h1>
                                    <span className='britti fs_14'>{value?.para}.</span>
                                </div>
                                <Form.Check
                                    type='radio'
                                    onChange={() => setVisibility(value?.type)}
                                    checked={value.type === visibility}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => handleContinue()} disabled={!visibility} className={`primary_btn w-full rounded-[15px] mt-5 ${!visibility ? "opacity-50" : ""}`}>
                    Continue
                </button>
            </div>

        </>
    )
}

export default Visibility
