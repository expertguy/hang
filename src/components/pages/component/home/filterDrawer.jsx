import React, { useEffect, useState } from 'react'
import { Offcanvas, Spinner } from 'react-bootstrap'
import { RiCloseLine } from 'react-icons/ri'
import { useSelector } from 'react-redux';
import ApiFunction from '../../../../utils/api/apiFuntions';

const FilterDrawer = ({ show, hide, setFilterData }) => {
    const [loading, setLoading] = useState(false);
    const [interestsList, setInterestsList] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [gender, setGender] = useState('all');
    const { post } = ApiFunction();
    // Handle interest selection
    const handleInterestChange = (event, interest) => {
        if (event.target.checked) {
            setSelectedInterests([...selectedInterests, interest]);
        } else {
            setSelectedInterests(selectedInterests.filter(item => item !== interest));
        }
    };

    // Handle language selection
    const handleLanguageChange = (event, language) => {
        if (event.target.checked) {
            setSelectedLanguages([...selectedLanguages, language]);
        } else {
            setSelectedLanguages(selectedLanguages.filter(item => item.name !== language.name));
        }
    };

    const resetAll = () => {
        setSelectedLanguages([]);
        setSelectedInterests([]);
        setFilterData({});
        hide();
    }

    useEffect(() => {

        const getInterestsList = async () => {
            const data = new FormData();
            data.append('type', 'get_data');
            data.append('table_name', 'interests');
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


    const setFilter = () => {
        const data = {};

        // Add gender to filter data if it's not 'all'
        if (gender) {
            data.gender = gender;
        }

        // Add interests to filter data if any are selected
        if (selectedInterests.length > 0) {
            data.interests = selectedInterests;
        }

        // Add languages to filter data if any are selected
        if (selectedLanguages.length > 0) {
            data.languages = selectedLanguages;
        }

        // Pass the filter data to parent component
        setFilterData(data);

        // Close the drawer after applying filters
        hide();

        console.log('Applied filters:', data); // For debugging
    };

    // Keeping the original lists as they were
    const commonLanguages = useSelector(state => state.appData?.languages);

    return (
        <>
            <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={show} placement='bottom' onHide={hide} className="offcanvas-bottom offcanvasBG">
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>Filter Hangers</h1>
                    <RiCloseLine onClick={hide} className='w-[24px] h-[24px] absolute right-5' />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {loading ? <>
                        <div className='h-[250px] flex items-center justify-center'>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    </> : <>
                        <div className=' flex flex-col pt-[20px] h-100 px-[15px] w-full'>
                            {/* _____________________- */}
                            <h1 className='text-start fs_14 britti_medium'>Gender</h1>
                            <div className='mx-0 mt-2'>
                                <div className='mx-auto mb-4 max-w-[450px]'>
                                    <div className="flex gap-3 items-center w-full">
                                        <div className='flex justify-center w-full'>
                                            <div className='bg-[#E1E4EA] rounded-[12px] p-1 pickup_group w-full'>
                                                <div className='d-flex position-relative'>
                                                    <button
                                                        className={`pickup_btn ${gender === 'all' ? 'active' : ''}`}
                                                        onClick={() => setGender('all')}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        className={`pickup_btn ${gender === 'male' ? 'active' : ''}`}
                                                        onClick={() => setGender('male')}
                                                    >
                                                        Male
                                                    </button>
                                                    <button
                                                        className={`pickup_btn ${gender === 'female' ? 'active' : ''}`}
                                                        onClick={() => setGender('female')}
                                                    >
                                                        Female
                                                    </button>
                                                    <div className='sliding-background'></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ______________________________ */}



                            {/* <h1 className='text-start fs_14 britti_medium'>Industry</h1>
                        <div className='w-full mt-2 interestsGroup'>
                            {industryList?.map((data, index) => (
                                <div className="interestItem" key={index}>
                                    <div className={selectedIndustries.includes(data) ? "interest" : "flex items-center justify-center h-100 px-[12px] border-1 border-transparent"}>
                                        {data}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={selectedIndustries.includes(data)}
                                        onChange={(e) => handleIndustryChange(e, data)}
                                    />
                                </div>
                            ))}
                        </div> */}

                            <h1 className='text-start fs_14 britti_medium mt-4'>Interests</h1>
                            <div className='w-full mt-2 interestsGroup'>
                                {interestsList?.map((data, index) => (
                                    <div className="interestItem" key={data?.id}>
                                        <div className={selectedInterests?.includes(data?.name) ? "interest" : "flex items-center justify-center h-100 px-[12px] border-1 border-transparent"}>
                                            {data?.name}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedInterests?.includes(data?.name)}
                                            onChange={(e) => handleInterestChange(e, data?.name)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <h1 className='text-start fs_14 britti_medium mt-4'>Languages</h1>
                            <div className='w-full mt-2 interestsGroup'>
                                {commonLanguages?.map((data, index) => (
                                    <div className="interestItem" key={index}>
                                        <div className={selectedLanguages.some(lang => lang.name === data.name) ? "interest" : "flex items-center justify-center h-100 px-[12px] border-1 border-transparent"}>
                                            <img
                                                src={data.flag}
                                                alt={`${data.name} flag`}
                                                className="w-[16px] h-[16px] rounded-full mr-1 object-cover"
                                            />
                                            {data.name}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguages.some(lang => lang.name === data.name)}
                                            onChange={(e) => handleLanguageChange(e, data)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="btnGroup grid grid-cols-2 w-full gap-2 mt-4">
                                <button onClick={() => resetAll()} className='transparent_btn bg-white w-full rounded-[12px]'>Reset All</button>
                                <button onClick={() => setFilter()} className='primary_btn w-full rounded-[12px]'>Apply Filters</button>
                            </div>
                        </div>
                    </>}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default FilterDrawer