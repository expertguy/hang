  import React, { useEffect, useState } from 'react'
  import { Offcanvas } from 'react-bootstrap'
  import { RiCloseLine, RiLinkedinFill } from 'react-icons/ri';
  import axios from 'axios';
  import { logoDark } from '../../../icons/icons';
  import { getLinkedInAuthURL } from '../../../../utils/linkedin/linkedinAuth';
  import { encryptData } from '../../../../utils/api/encrypted';
  import { useDispatch } from 'react-redux';
  import {  setUserData, setUserToken } from '../../../redux/appDataSlice';
  import { toast } from 'react-toastify';
  import {  Link, useNavigate } from 'react-router-dom';

  // Create axios instance with base URL
  const apiClient = axios.create({
    baseURL: 'https://app.hangnetwork.com/api.php',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const LoginDrawer = ({ show, close, successLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
const Navigate = useNavigate();
    const getUserData = async (code, state = null) => {
      setIsLoading(true);
      const data = {
        type: 'social_login',
        token: code,
        state: state
      };

      try {
        // Using custom axios instance
        const response = await apiClient.post('', data);
        if (response?.data && response?.data?.success) {
          const userData = response?.data;
          const tokenData = response.data?.user_id;
          const encryptoken = encryptData(tokenData);
          dispatch(setUserToken(encryptoken));

          
          const encrypedData = encryptData(response?.data);
          dispatch(setUserData(encrypedData));

          toast.success("Login Successfull");
          Navigate('/onboading');
          // Call success callback
          successLogin(userData);

          // Close the drawer
          // close();

          return userData;
        } else {
          console.error('API returned failure:', response.data);
          throw new Error(response.data.error || response.data.message || 'Authentication failed');
        }
      } catch (err) {
        let errorMessage = 'Authentication failed';
        if (err.response && err.response.data) {
          errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }

        alert(`Authentication failed: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    const handleLinkedInLogin = () => {
      if (isLoading) return;
      window.location.href = getLinkedInAuthURL();
    };

    // eslint-disable-next-line no-unused-vars
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
      // Get all URL parameters for debugging
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      // Log everything for debugging
      const debugData = {
        fullUrl: window.location.href,
        code: code,
        state: state,
        error: error,
        errorDescription: errorDescription,
        allParams: Object.fromEntries(urlParams.entries())
      };

      setDebugInfo(debugData);

      // Handle different scenarios
      if (error) {
        handleAuthError(error, errorDescription);
      } else if (code && code.trim() !== '') {
        handleAuthSuccess(code, state);
      } else {
        // un-comment for error handleing
        // console.log('=== NO CODE OR ERROR ===');
        // console.log('No code or error received - checking for other issues');
        // console.log('Code value:', code);
        // console.log('Code type:', typeof code);
        // console.log('Code is empty:', !code || code.trim() === '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAuthError = (error, description) => {
      let userMessage = 'LinkedIn authentication failed. ';

      userMessage += `Error: ${error}. ${description || ''}`;

      alert(userMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    const handleAuthSuccess = async (code, state) => {

      // Clean up URL first
      window.history.replaceState({}, document.title, window.location.pathname);

      // Get user data from backend
      await getUserData(code, state);
    };

    return (
      <>
        <Offcanvas
          backdropClassName="blurred-backdrop-offcanvas"
          show={show}
          onHide={close}
          placement="bottom"
          className="offcanvas-bottom"
        >
          <Offcanvas.Header className='relative py-4'>
            <h1 className='britti fs_18 mb-0 text-center w-full'>Login</h1>
            <RiCloseLine onClick={close} className='w-[24px] h-[24px] absolute right-5' />
          </Offcanvas.Header>

          <Offcanvas.Body className='relative'>
            <div className='bg_shadow_primary'></div>
            <div className='pt-5 flex flex-col items-center justify-evenly h-100 px-[15px]'>
              <img src={logoDark} className='w-[80px] h-[100px] mx-auto' alt="" />

              <div>
                <h1 className='britti_medium fs_24 text-center mt-5'>Login to Your Account</h1>
                <h2 className='txt_grey fs_16 mt-3 text-center max-w-[85%] mx-auto'>
                  Turn every journey into an opportunity for meaningful networking
                </h2>
              </div>

              <button
                onClick={handleLinkedInLogin}
                disabled={isLoading}
                className={`w-100 mt-4 flex items-center justify-center bg-[#0077B5] text-white britti_medium fs_18 py-3 rounded-[18px] gap-[11px] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RiLinkedinFill className='bg-white rounded-[3px] p-[2px] w-[20px] h-[20px] text-[#0077B5]' />
                {isLoading ? 'Processing...' : 'Continue with LinkedIn'}
              </button>

              <button
                onClick={() => {
                  close();
                  Navigate('/home');
                }}
                disabled={isLoading}
                className={`w-100 mt-3 flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 britti_medium fs_18 py-3 rounded-[18px] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Continue as Guest
              </button>

              <span className='fs_14 txt_grey mt-4'>
                By continuing, you agree to our <Link to={'/terms'} className='underline'>Terms </Link> & <Link to={'/privacy'} className='underline'>Privacy Policy</Link>
              </span>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </>
    )
  }

  export default LoginDrawer