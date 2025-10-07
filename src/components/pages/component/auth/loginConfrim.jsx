import { Offcanvas } from 'react-bootstrap'
import { RiCloseLine } from 'react-icons/ri';
import { User } from '../../../icons/icons';
import { encryptData } from '../../../../utils/api/encrypted';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../../redux/appDataSlice';
const LoginConfirm = ({ show, close, data = {} }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const login = () => {
        const encrypedData = encryptData(data);
        dispatch(setUserData(encrypedData));

        toast.success("Login Successfull");
        navigate('/onboading');
    }

    return (
        <>
            <Offcanvas className="loginConfirm" backdropClassName="blurred-backdrop-offcanvas"
                show={show} onHide={close} placement="bottom"  >
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>Login</h1>

                    <RiCloseLine onClick={close} className='w-[24px] h-[24px] absolute right-5' />
                </Offcanvas.Header>
                <Offcanvas.Body className='relative'>
                    <div className='bg_shadow_primary'></div>
                    <div className=' flex flex-col items-center justify-evenly h-100 px-[15px]'>
                        <div className='h-[120px] w-[120px] relative p-2 object-cover bg_avatar rounded-full'>
                            <img src={data?.image ?? User} className='mx-auto bottom-0 left-0 absolute rounded-full' alt="" />
                        </div>
                        <div>
                            <h1 className='britti_medium fs_24 text-center'>Welcome to Hang!</h1>
                            <h2 className='txt_grey fs_16 mt-2 text-center'>We’ve imported your professional info from LinkedIn. Please review before continuing.</h2>
                        </div>
                        <div className='detail_card w-full gap-[10px]'>
                            <div className='h-[50px] w-[50px] relative object-cover bg_avatar rounded-full'>
                                <img src={data?.image ?? User} className='mx-auto rounded-full' alt="" />
                            </div>
                            <div className='h-full flex justify-center  flex-col'>
                                <h1 className='britti_bold fs_16'>{data?.name}</h1>
                                <h2 className='txt_grey fs_14 mb-0'>{data?.email ?? "Product Manager - TechCorp Inc."}</h2>
                            </div>
                        </div>
                        <span className='fs_14 max-w-[80%] mx-auto txt_grey text-center'>Your professional network doesn't stop when
                            you travel - it expands.</span>
                        <button className='w-100 primary_btn rounded-[16px]' onClick={() => login()}>Continue</button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default LoginConfirm
