import React from 'react'
import { ProgressBar } from 'react-bootstrap'
import { RiArrowLeftLine } from 'react-icons/ri'

const OnboadingHeader = ({step,setPrev}) => {
  return (
    <>
      <div className='onboadingHeader'>
        <RiArrowLeftLine onClick={() => setPrev()} className='w-[24px] h-[24px]'/>
        <div className='w-[75%] onboadingProgress'>
        <ProgressBar variant="info" now={step === 1 ? 50 : 100  } />
        </div>
        <h1 className='fs_16 mb-0'>{step}/2</h1>
      </div>
    </>
  )
}

export default OnboadingHeader
