import React, { useState } from 'react'
import { Mobile } from '../../icons/icons'
import LoginDrawer from '../component/auth/loginDrawer'
import LoginConfirm from '../component/auth/loginConfrim';
import { useNavigate } from 'react-router-dom';

const Login = () => {
      const navigate = useNavigate();
      const [show, setShow] = useState(false);
      const [userData,setUserdata] = useState({});
      const handleShow = () => setShow(true);
      const handleClose = () => setShow(false);

      const [ConfrimLogin,setConfirmLogin] = useState(false);
      const handleConfrimShow = (data) => {
        setConfirmLogin(true);
        setShow(false);
        setUserdata(data);
      }
      const handleConfrimClose = () => setConfirmLogin(false);
  return (
    <>
      <div className='relative flex flex-col items-center h_100vh justify-center'>
        <img src={Mobile} alt='' />

        <div className='loginBottom'>
          <div>
            <h1 className='britti_bold text-center fs_24'>
              Discover People Nearby
            </h1>
            <span className='text-center fs_16 txt_grey'>
              Transform digital connections into real-world experiences.
            </span>
          </div>
          <button onClick={() => handleShow()} className='primary_btn w-full rounded-[18px] h-[56px] britti_medium fs_18 mt-5'>
            Login
          </button>
          <button
            onClick={() => navigate('/home')}
            className='w-full rounded-[18px] h-[56px] britti_medium fs_18 mt-3 bg-white border-2 border-gray-300 text-gray-700'
          >
            Continue as Guest
          </button>
        </div>
      </div>
      <LoginDrawer show={show} close={handleClose} successLogin={handleConfrimShow}/>
      <LoginConfirm show={ConfrimLogin} close={handleConfrimClose} data={userData}/>
    </>
  )
}

export default Login
