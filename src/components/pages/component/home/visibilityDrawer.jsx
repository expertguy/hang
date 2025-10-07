import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import { RiCheckLine, RiCloseLine } from 'react-icons/ri'
import { useDispatch, useSelector, } from 'react-redux'
import { setVisibility, setVisibilityData } from '../../../redux/appDataSlice'

const VisibilityDrawer = () => {
    const dispatch = useDispatch();
    const [selectedOptions, setSelectedOptions] = useState([]);
    
    const hide = () => dispatch(setVisibility(false));
    // Fixed: Changed from Visibility to visibility (lowercase)
    const show = useSelector(state => state?.appData?.visibility);
    
    const data = [
        { heading: 'Everyone', title: 'All users in your area.', value: 'everyone' },
        { heading: 'Same industry', title: 'Only users from your professional industry.', value: 'industry' },
        { heading: 'Similar interests', title: 'Only users who share one of your interests.', value: 'interests' },
        { heading: 'Similar Language', title: 'Only users who speak the same language.', value: 'language' },
        { heading: 'Same Gender', title: 'Only users who share your gender.', value: 'gender' },
    ]

    const handleCheckboxChange = (value, heading) => {
        if (heading === 'Everyone') {
            // If "Everyone" is selected, clear all other selections and only select "Everyone"
            if (selectedOptions.includes(value)) {
                setSelectedOptions([]);
            } else {
                setSelectedOptions([value]);
            }
        } else {
            // If any other option is selected, remove "Everyone" if it's selected
            let newSelected = selectedOptions.filter(item => item !== 'everyone'); // Remove "Everyone"
            
            if (newSelected.includes(value)) {
                // If already selected, remove it
                newSelected = newSelected.filter(item => item !== value);
            } else {
                // If not selected, add it
                newSelected = [...newSelected, value];
            }
            
            setSelectedOptions(newSelected);
        }
    };

    const onSubmit = () => {
        // Handle form submission
        dispatch(setVisibilityData(selectedOptions));
        hide();
    };

    return (
        <>
            <Offcanvas
                backdropClassName="blurred-backdrop-offcanvas"
                show={show}
                placement='bottom'
                onHide={hide}
                className="offcanvas-bottom offcanvasBG"
                style={{minHeight:'80%'}}
            >
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>Who can see me?</h1>
                    <RiCloseLine onClick={hide} className='w-[24px] h-[24px] absolute right-5 cursor-pointer' />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {/* Header */}
                    <h1 className='text-start fs_20 britti_medium'>Set Your Visibility</h1>
                    <h2 className='txt_grey fs_16'>Control who can see your check-ins on the map.</h2>

                    <div className="visibilityGroup mt-4">
                        {data?.map((item, index) => {
                            const isSelected = selectedOptions.includes(item?.value);
                            
                            return (
                                <div 
                                    className={`visibilityItem ${isSelected ? 'active' : ''}`} 
                                    key={index}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => handleCheckboxChange(item?.value, item.heading)}
                                    />
                                    <div>
                                        <h1 className='britti_medium fs_16 mb-1'>{item?.heading}</h1>
                                        <p className='mb-0 fs_14 txt_dark'>{item?.title}</p>
                                    </div>

                                    <RiCheckLine className={`h-[20px] w-[20px] ${isSelected ? 'txt_primary' : 'text-[#aeb0b4]'}`} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="btnGroup grid grid-cols-1 w-full gap-2 mt-4">
                        <button
                            className="primary_btn w-full rounded-[12px]"
                            onClick={onSubmit}
                        >
                            Continue
                        </button>
                    </div>

                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default VisibilityDrawer