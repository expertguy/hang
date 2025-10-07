import React, { useEffect, useState } from 'react';
import { LanguageIcon } from '../../../icons/icons';
import { RiGlobalLine } from 'react-icons/ri';
import CustomMultiSelect from '../formElements/customMultiSelect';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguagesData } from '../../../redux/onboadingDataSlice';

const Language = ({ setStep }) => {
    const prevSelectedData = useSelector(state => state?.onboading?.languages);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    
    useEffect(() => {
        if (prevSelectedData && prevSelectedData.length > 0) {
            setSelectedLanguages(prevSelectedData);
        }
    }, [prevSelectedData]);

    const languages = useSelector((state) => state.appData?.languages);

    // Handle language selection change - now receives just language names
    const handleLanguageChange = (newSelectedLanguageNames) => {
        setSelectedLanguages(newSelectedLanguageNames);
    };
    
    const isMinimumSelected = selectedLanguages?.length >= 1;
    const dispatch = useDispatch();
    
    const handleContinue = () => {
        // Dispatch just the language names (strings) instead of full objects
        dispatch(setLanguagesData(selectedLanguages));
        setStep();
    }
    
    return (
        <div className='p-[35px] h_90vh flex items-center justify-between flex-col'>
            <div className='flex items-center justify-between w-full flex-col'>
                <img src={LanguageIcon} className='w-[96px] h-[96px] mb-3' alt="" />
                <h1 className='britti_medium fs_24'>Choose Your Languages</h1>
                <span className='txt_grey fs_16 text-center mb-6'>
                    Select languages you speak to help others connect with you easily.
                </span>

                <div className="choose-languages-text mr-auto mb-1">Choose Languages</div>
                
                {/* Reusable Custom Select Component */}
                <CustomMultiSelect
                    data={languages}
                    selectedItems={selectedLanguages} // This should work with string array
                    onSelectionChange={handleLanguageChange} // Now receives array of strings
                    placeholder="Add Languages..."
                    searchPlaceholder="Search languages..."
                    displayKey="name"
                    searchKey="name"
                    iconKey="flag"
                    icon={<RiGlobalLine className='w-[20px] h-[20px]' />}
                    showIcon={true}
                    showSelectedTags={true}
                    multiSelect={true}
                    maxHeight="300px"
                    emptyMessage="No languages found"
                    className="w-full"
                />
            </div>
            
            <button 
                onClick={() => handleContinue()} 
                className={`primary_btn w-full rounded-[15px] mt-5 ${!isMinimumSelected ? 'opacity-50' : ""}`}
                disabled={!isMinimumSelected}
            >
                Continue
            </button>
        </div>
    );
};

export default Language;