/* eslint-disable no-unused-vars */
import { Container, Nav, Navbar } from "react-bootstrap";
import { BsArrowLeftShort } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";

const BackNavHeader = ({ name }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const itemsData = [
        { path: '/', name: 'Home' },
        { path: '/upload', name: 'Upload' },
        { path: '/grand-prix', name: 'Grand Prix' },
        { path: '/map', name: 'Location' },
        { path: '/post', name: 'Post' },
        { path: '/auth/sign-up', name: 'Create Account' },
        { path: '/auth/login', name: 'Login' },
        { path: '/post-detail', name: 'Post Detail' },
    ];
    const isValidBack = ['/', '/auth/login', '/grand-prix','post']

    const currentRoute = itemsData.find(item => item.path === pathname);

    const routeName = currentRoute ? currentRoute.name : 'Unknown Route';
    return (
        <>
            <Navbar
                bg="white"
                expand="lg"
                sticky="top"
                className="px-2 py-[12px] min-h-[60px]  border-b border-[#E6E6E6] w-[100%] min-sm-hidden"
                id="navbar"
            >
                <Container fluid className="w-full relative">
                    {!isValidBack.includes(pathname) && <button onClick={() => navigate(-1)} className="absolute inset-0 " ><BsArrowLeftShort size={30} /> </button>}
                    <span className="popins_medium mx-auto text-lg mt-1 capitalize">{routeName}</span>
                </Container>
            </Navbar>
        </>
    );
};

export default BackNavHeader;