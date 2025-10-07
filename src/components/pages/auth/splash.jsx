import React, { useEffect, useState } from 'react'
import { logo } from '../../icons/icons'
import { RiInformationFill } from 'react-icons/ri'
import ApiFunction from '../../../utils/api/apiFuntions';

const Splash = () => {

  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const data = new FormData();
  data.append('type', 'get_data');
  data.append('table_name', 'preferences');
  data.append('id', 1);


  const { post } = ApiFunction();

  useEffect(() => {
    const getPreferences = async () => {
      setLoading(true);
      await post('', data)
        .then(response => {
          if (response?.data) {
            setPromoTitle(response?.data[0]?.promo_title);
            setPromoMessage(response?.data[0]?.promo_message);
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
      <div className="h_100vh flex flex-col items-center justify-evenly bg_dark">
        <div>
          <img src={logo} className="w-[137px]" alt="" />
          <h1 className='text-center text-white mt-5 fs_18'>Back To Reality</h1>
        </div>
        <div class="spinner-container">
          <div class="spinner-ring">
            <div class="spinner-inner"></div>
          </div>
        </div>
        {promoTitle && promoTitle !== '' && promoMessage && promoMessage !== '' ? <>
          <div className='promo'>
            <RiInformationFill className='text-[#4A8DFF]' />
            <div>
              <h1>{promoTitle}</h1>
              <p>{promoMessage}</p>
            </div>
          </div>
        </> : <></>}

      </div>
    </>
  )
}

export default Splash