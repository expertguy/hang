import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Nomatch = () => {
    return (
        <Container className=" text-center py-0">
            <div className="flex justify-center items-center flex-col auth-pages">
                <h3 className="text-danger display-6">404</h3>
                <h5 className="mb-3 text-dark">Page Not Found</h5>
                <p className="text-muted text-sm mb-4">
                    The page you're looking for doesn't exist or has been moved. Check the URL or return to the homepage.
                </p>
                <Link to={-1} className='no-underline'>
                    <Button variant="dark" size="sm" className='btn1'>
                        Back to Homepage
                    </Button>
                </Link>
            </div>
        </Container>
    );
};

export default Nomatch;
