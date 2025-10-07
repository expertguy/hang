import React, { useEffect, useState } from 'react'
import { logo } from '../icons/icons'
import ApiFunction from '../../utils/api/apiFuntions'

const LoadingPage = () => {
    const [loading, setLoading] = useState(false);
    const [promo,setPromo] = useState('');
    const data = new FormData();
    data.append('type', 'get_data');
    data.append('table_name', 'interests');


    const { post } = ApiFunction();

    useEffect(() => {
        const getInterestsList = async () => {
            setLoading(true);
            await post('', data)
                .then(response => {
                    if (response?.data) {
                        setPromo(response?.data?.promo);
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

    return (
        <main className='flex justify-center items-center home-h' >
            <div className='flex flex-col justify-center items-center'>
                <img src={logo} alt='Logo' className='w-[70px] h-[70px]' />
                <h3 className='popins_semibold'>Formula Fan</h3>
                <p className='popins_light'>To live and share your F1 passion</p>
            </div>
        </main>
    )
}

export default LoadingPage
