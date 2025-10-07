import React from 'react'
import { Offcanvas } from 'react-bootstrap'
import { RiCloseLine } from 'react-icons/ri'
import { OnboadingSuccess } from '../../../icons/icons'

const CheckOutComplete = ({ show, hide ,checkInShow }) => {

    const handleCheckOut = () => {
        hide();
checkInShow();
    }

    return (
        <>
            <Offcanvas backdropClassName="blurred-backdrop-offcanvas" show={show} placement='bottom' onHide={hide} className="offcanvas-bottom offcanvasBG">
                <Offcanvas.Header className='relative py-4'>
                    <h1 className='britti fs_18 mb-0 text-center w-full'>Check-out</h1>
                    <RiCloseLine onClick={hide} className='w-[24px] h-[24px] absolute right-5' />
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className=' flex flex-col items-center pt-[20px] h-100 sm:px-[15px]'>
                        <div className=''>
                            <img src={OnboadingSuccess} className='mx-auto object-cover h-[96px] w-[96px] rounded-full' alt="" />
                        </div>
                        <div className='mt-3'>
                            <h1 className='britti_medium fs_24 text-center'>Check-Out Complete</h1>
                            <h2 className='txt_grey fs_16 mt-2 text-center'>You’ve successfully checked out of Starbucks. You’re now invisible on the map.</h2>
                        </div>

                        <div className="btnGroup grid grid-cols-1 w-full gap-2 mt-4">
                            <button className='primary_btn w-full rounded-[12px]' onClick={() => handleCheckOut()}>Check In Again</button>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default CheckOutComplete
