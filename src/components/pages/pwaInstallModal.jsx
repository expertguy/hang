import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import { RiCloseLine } from 'react-icons/ri';

export function SimplePwaModal({ open, onClose, onInstall, showInstall, onPermanentDismiss }) {
    //   if (!open) return null;
    console.log(showInstall)
    return (
        <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={open} placement='bottom' onHide={onClose} className="offcanvas-bottom offcanvasBG">
            <Offcanvas.Header className='relative py-4'>
                <h1 className='britti fs_18 mb-0 text-center w-full'>Download App</h1>
                <RiCloseLine onClick={onClose} className='w-[24px] h-[24px] absolute right-5' />
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className=' flex flex-col items-center pt-[20px] h-100 sm:px-[15px]'>
                    
                    <div className='mt-1 w-full'>
                        <h1 className='britti_medium fs_24 text-center'>Download HANG</h1>
                        <h2 className='txt_grey fs_16 mt-2 text-center mb-4'>Download this app to get the best experience</h2>
                        <div className={`grid ${showInstall ? "grid-cols-2" : "grid-cols-1"}  gap-2 mb-3`}>
                        {showInstall && <button onClick={onInstall} className='primary_btn w-full rounded-[12px]'>Install</button>}
                        <button onClick={onClose} className='transparent_btn w-full h-[55px] bg-[#fff]'>Close</button>
                        </div>
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

        // <div style={{
        //   position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        //   background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        // }}>
        //   <div style={{
        //     background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, textAlign: 'center'
        //   }}>
        //     <h2>Install Hang App 123</h2>
        //     <p>You can add this app to your home screen for a better experience.</p>
        //     {showInstall && <button onClick={onInstall} style={{ marginRight: 8 }}>Install</button>}
        //     <button onClick={onClose}>Close</button>
        //   </div>
        // </div>
    );
}