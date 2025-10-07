/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { RiCustomerServiceLine, RiEditLine, RiExternalLinkLine, RiFileList3Line, RiFileShield2Line, RiMailLine, RiNotification3Line } from 'react-icons/ri'
import { Linkdin } from '../icons/icons'
import { RiArrowRightSLine, RiLinkUnlinkM } from '@remixicon/react'
import FooterHome from './footerHome'
import Unlink from './component/settings/unLink'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { decryptData, encryptData } from '../../utils/api/encrypted'
import ApiFunction from '../../utils/api/apiFuntions'
import { setUserData } from '../redux/appDataSlice'

const Settings = () => {
    const [unLinkDrawer, setunLinkDrawer] = useState(false);
    const showUnLinkDrawer = () => setunLinkDrawer(true);
    const hideUnLinkDrawer = () => setunLinkDrawer(false);
    const { post } = ApiFunction();
    const dispatch = useDispatch();
    const userTokenEncrypted = useSelector(state => state?.appData?.userToken);
    const userToken = decryptData(userTokenEncrypted);
    const fetchUserData = async () => {
        const userData = {
            table_name: 'users',
            type: 'get_data',
            id: userToken
        }

        await post('', userData)
            .then(res => {
                if (res?.data[0]) {
                    const resData = res?.data[0];
                    const dataEncrypt = encryptData(resData);
                    dispatch(setUserData(dataEncrypt));
                }
            })
            .catch(err => {
                console.log("the error is ", err);
            })
            .finally(() => {

            })
    }

    useEffect(() => {
        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const encryptedData = useSelector(state => state?.appData?.userData);
    const userData = decryptData(encryptedData);
    return (
        <>
            <div className='sm:px-4 sm:py-4 px-3 py-4 h_100vh'>
                <div className='flex items-center justify-between bg-white pb-3'>
                    <h1 className='britti_medium fs_24 mb-0'>Profile</h1>
                    <div className='h-[38px] w-[38px] flex items-center bg_weak justify-center rounded-full'>
                        <RiLinkUnlinkM onClick={() => showUnLinkDrawer()} className='text-[#525866] cursor-pointer ms-auto w-[20px] mx-2 h-[20px]' />
                        {/* <RiEditLine className='txt_primary w-[20px] h-[20px]' /> */}
                    </div>
                </div>
                <div className='main_body'>
                    <Link to={'/settings/profile'} >
                        <div className='profileCard mt-4 flex items-center gap-3'>
                            <div className='profile_Image'>
                                <img src={(userData?.image)} className='' alt="" />
                            </div>
                            <div>
                                <h2 className='fs_16 britti_medium mb-1'>{userData?.name}</h2>
                                <span className='fs_14 txt_grey'>{userData?.designation} - {userData?.company}.</span>
                            </div>
                            <RiArrowRightSLine className='ms-auto w-[20px] h-[20px]' />
                        </div>
                    </Link>
                    {/* <div className='profileCard  mt-3'>
                        <h1 className='text-[#99A0AE] mb-2 mt-1 mx-2 fs_16 britti_medium'>Linked Account</h1>
                        <div className='flex bg_weak py-4 px-3 rounded-[16px] items-center gap-3'>
                            <div className='profile_Image'>
                                <img src={userData?.image} className='' alt="" />
                                <img src={Linkdin} className='linkdin' alt="" />
                            </div>
                            <div>
                                <h2 className='fs_16 britti_bold mb-1'>{userData?.name}</h2>
                                <span className='fs_14 txt_grey'>{userData?.email}</span>
                            </div>
                            <RiLinkUnlinkM onClick={() => showUnLinkDrawer()} className='text-[#525866] cursor-pointer ms-auto w-[20px] mx-2 h-[20px]' />
                        </div>
                    </div> */}
                    <div className='profileCard mt-3'>
                        <h1 className='text-[#99A0AE] fs_16 mb-2 mt-1 mx-2 britti_medium'>General</h1>
                        <Link to={'/notification'} className='flex bg_weak py-3 mb-2 px-3 rounded-[16px] items-center gap-3'>
                            <RiNotification3Line className='w-[18px] h-[18px] txt_primary' />
                            <h2 className='fs_16 text-[#0E121B] britti_medium mb-0'>Reminder Notifications</h2>
                            <div className='ms-auto'>
                            </div>
                        </Link>
                        <Link to={'/settings/contact'} >
                        <div className='flex bg_weak py-3 mb-2 px-3 rounded-[16px] items-center gap-3'>
                            <RiCustomerServiceLine className='w-[18px] h-[18px] txt_primary' />
                            <h2 className='fs_16 text-[#0E121B] britti_medium mb-0'>Help and Support</h2>
                            <RiArrowRightSLine className='ms-auto w-[20px] h-[20px]' />
                        </div>
                        </Link>
                        <a href='mailto:support@hangnetwork.com'>
                            <div className='flex bg_weak py-3 mb-2 px-3 rounded-[16px] items-center gap-3'>
                                <RiMailLine className='w-[18px] h-[18px] txt_primary' />
                                <h2 className='fs_16 text-[#0E121B] britti_medium mb-0'>Contact Us</h2>
                                <RiExternalLinkLine className='ms-auto w-[20px] h-[20px]' />
                            </div>
                        </a>
                        <Link to={'/terms'} >
                            <div className='flex bg_weak py-3 mb-2 px-3 rounded-[16px] items-center gap-3'>
                                <RiFileList3Line className='w-[18px] h-[18px] txt_primary' />
                                <h2 className='fs_16 text-[#0E121B] britti_medium mb-0'>Terms & Conditions</h2>
                                <RiExternalLinkLine className='ms-auto w-[20px] h-[20px]' />
                            </div>
                        </Link>
                        <Link to={'/privacy'} >
                            <div className='flex bg_weak py-3 mb-2 px-3 rounded-[16px] items-center gap-3'>
                                <RiFileShield2Line className='w-[18px] h-[18px] txt_primary' />
                                <h2 className='fs_16 text-[#0E121B] britti_medium mb-0'>Privacy Policy</h2>
                                <RiExternalLinkLine className='ms-auto w-[20px] h-[20px]' />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <FooterHome />
            <Unlink show={unLinkDrawer} hide={hideUnLinkDrawer} />
        </>
    )
}

export default Settings
