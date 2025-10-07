import React, { useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import { RiCloseLine, RiLinkUnlinkM } from 'react-icons/ri'
import { Linkdin, Person2, UnlinkIcon } from '../../../icons/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { decryptData } from '../../../../utils/api/encrypted'
import { logoutUser } from '../../../redux/appDataSlice'
import toast from 'react-hot-toast'
import CheckInManage from '../home/checkInManage'
import CheckOutComplete from '../home/checkOutComplete'

const Unlink = ({ show, hide }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const encryptedData = useSelector(state => state?.appData?.userData);
    const userData = decryptData(encryptedData);
    
    // Check-in management states
    const [showCheckInManage, setShowCheckInManage] = useState(false);
    const [showCheckoutComplete, setShowCheckoutComplete] = useState(false);
    
    
    // Get check-in status from Redux
    const checkInStatus = useSelector(state => state.appData?.checkInStatus);
    
    
    const handleCheckInManageClose = () => setShowCheckInManage(false);
    const handleCheckoutCompleteClose = () => {
        setShowCheckoutComplete(false);
        // After checkout complete, proceed with logout
        proceedWithLogout();
    };
    const handleCheckoutCompleteShow = () => setShowCheckoutComplete(true);
    
    const proceedWithLogout = () => {
        localStorage.clear();
        
        // Clear the Redux store using your logoutUser action
        dispatch(logoutUser());
        toast.success("logout successfully");
        hide();
        navigate('/');
    }
    
    const handleLogoutClick = () => {
        // Check if user is currently checked in
        if (checkInStatus) {
            // User is checked in, show CheckInManage first
            hide(); // Hide the unlink drawer
            setShowCheckInManage(true);
        } else {
            // User is not checked in, proceed with logout directly
            proceedWithLogout();
        }
    }
    
    

    return (
        <>
            <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={show} placement='bottom' onHide={hide} className="offcanvas-bottom offcanvasBG">
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>Unlink Account</h1>
                    <RiCloseLine onClick={hide} className='w-[24px] h-[24px] absolute right-5' />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className=' flex flex-col items-center pt-[20px] h-100 sm:px-[15px]'>
                        <div className=''>
                            <img src={UnlinkIcon} className='mx-auto object-cover min-h-[96px] min-w-[96px] max-h-[96px] max-w-[96px] bg-[#ACCBFF] rounded-full' alt="" />
                        </div>
                        <div className='mt-3'>
                            <h1 className='britti_medium fs_24 text-center'>Are you sure?</h1>
                            <h2 className='txt_grey fs_16 mt-2 text-center'>Are you sure you want to unlink your LinkedIn account? without LinkedIn you will not be able to use  app</h2>
                        </div>


                        <div className='profileCard w-full mt-3'>
                            <h1 className='text-[#99A0AE] mb-2 mt-1 mx-2 fs_14 britti_medium'>Linked Account</h1>
                            <div className='flex bg_weak py-4 px-3 rounded-[16px] items-center gap-3'>
                                <div className='profile_Image'>
                                    <img src={userData?.image ?? Person2} className='' alt="" />
                                    <img src={Linkdin} className='linkdin' alt="" />
                                </div>
                                <div>
                                    <h2 className='fs_16 britti_bold mb-1'>{userData?.name}</h2>
                                    <span className='fs_14 txt_grey'>{userData?.email}</span>
                                </div>
                                <RiLinkUnlinkM className='text-[#525866] cursor-pointer ms-auto min-w-[20px] max-w-[20px] mx-2 min-h-[20px] max-h-[20px]' />
                            </div>
                        </div>

                        <div className="btnGroup grid grid-cols-1 w-full gap-2 mt-4">
                            <button className='primary_btn w-full rounded-[12px]' onClick={() => handleLogoutClick()}>Confirm</button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
            
            {/* CheckInManage modal */}
            <CheckInManage
                show={showCheckInManage}
                hide={handleCheckInManageClose}
                checkInShow={() => {}} // No need for check-in since user wants to logout
                successDrawer={handleCheckoutCompleteShow}
            />
            
            {/* CheckOutComplete modal */}
            <CheckOutComplete
                show={showCheckoutComplete}
                hide={handleCheckoutCompleteClose}
                checkInShow={() => {}} // No need for check-in since user wants to logout
            />
            
        </>
    )
}

export default Unlink