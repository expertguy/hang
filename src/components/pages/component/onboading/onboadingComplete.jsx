import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboadingSuccess } from '../../../icons/icons'
import { decryptData, encryptData } from '../../../../utils/api/encrypted';
import { setUserData } from '../../../redux/appDataSlice';
import ApiFunction from '../../../../utils/api/apiFuntions';
import { useSelector } from 'react-redux';

const OnboadingComplete = ({ setStep }) => {
  const navigate = useNavigate();
  const { post } = ApiFunction();
  const [countdown, setCountdown] = useState(5);
  const encryptedToken = useSelector(state => state?.appData?.userToken);
  const user_id = decryptData(encryptedToken);
  const fetchUserData = async () => {

    const userData = {
      table_name: 'users',
      type: 'get_data',
      id: user_id
    }

    await post('', userData)
      .then(res => {
        if (res?.data[0]) {
          const resData = res?.data[0];
          const dataEncrypt = encryptData(resData);
          dispatchEvent(setUserData(dataEncrypt));
        }
      })
      .catch(err => {
        console.log("the error is ", err);
      })
      .finally(() => {

      })
  }
  useEffect(() => {
    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Redirect to home page when countdown reaches 0
          fetchUserData();

          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(countdownInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <>
      <div className=''>

      </div>
      <div className='p-[35px] onboadingComplete h_100vh flex items-center justify-between flex-col'>
        <div className='flex h_65vh px-4 items-center justify-center h-full w-full flex-col'>
          <img src={OnboadingSuccess} className='w-[96px]' alt="" />
          <h1 className='text-center britti_bold fs_24 mt-3'>Profile setup complete!</h1>
          <span className='text-center fs_16 txt_grey britti'>Your profile has been set up successfully.</span>
        </div>

        <p className='txt_dark'>
          Redirecting to the map in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>

        {/* Optional: Add a manual navigation button */}
        {/* <button 
          onClick={() => navigate('/home')} 
          className='primary_btn w-full rounded-[15px] mt-2'
        >
          Go Now
        </button> */}
      </div>
    </>
  )
}

export default OnboadingComplete