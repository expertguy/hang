import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { RiCloseLine } from 'react-icons/ri';

export function IosPwaInstructionsModal({ open, onClose, onPermanentDismiss }) {
    return (
        <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={open} placement='bottom' onHide={onClose} className="offcanvas-bottom offcanvasBG">
            <Offcanvas.Header className='relative py-4'>
                <h1 className='britti fs_18 mb-0 text-center w-full'>Add to Home Screen</h1>
                <RiCloseLine onClick={onClose} className='w-[24px] h-[24px] absolute right-5' />
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className=' flex flex-col items-center pt-[20px] h-100 sm:px-[15px]'>
                    <div className='mt-1 w-full'>
                        <h1 className='britti_medium fs_24 text-center'>Install HANG on iPhone</h1>
                        <h2 className='txt_grey fs_16 mt-2 text-center mb-4'>Follow these steps to add this app to your home screen</h2>
                        <div className='text-left max-w-[520px] mx-auto'>
                            <ol className='list-decimal pl-5 space-y-2 fs_14 txt_grey'>
                                <li>Open in Safari if you are in another browser.</li>
                                <li>Tap the Share button (square with an up arrow) at the bottom.</li>
                                <li>Scroll down and tap <span className='font-medium'>Add to Home Screen</span>.</li>
                                <li>Tap <span className='font-medium'>Add</span> in the top-right.</li>
                            </ol>
                        </div>
                        <button onClick={onClose} className='transparent_btn w-full h-[55px] bg-[#fff] mt-4 mb-3'>Close</button>
                        {onPermanentDismiss && (
                        <button 
                            onClick={onPermanentDismiss} 
                            className='text-sm text-gray-500 underline w-full text-center'
                        >
                            Don't show again
                        </button>
                        )}
                    </div>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default IosPwaInstructionsModal;


