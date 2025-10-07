import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OnboadingHeader from './onboadingHeader'
import Interests from './interests';
import OnboadingComplete from './onboadingComplete';
import { decryptData } from '../../../../utils/api/encrypted';
import { useSelector } from 'react-redux';
import OnboadingReview from './onboadingReview';

const Onboading = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const encryptedData = useSelector(state => state.appData?.userData);
  const userData = decryptData(encryptedData);
  useEffect(() => {
    checkOnboardingStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const checkOnboardingStatus = () => {
    try {
      // Get the API response (you might get this from props, context, or localStorage)
      const apiResponse = userData; // Replace with your actual method
      const prevCompleted = localStorage.getItem('onboading_completed') ?? false;
      if (!apiResponse?.created || prevCompleted) {
        // If created is false, navigate to home page
        navigate('/home', { replace: true });
        return;
      }
      
      // If created is true and onboarding not completed, show onboarding
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, redirect to home as fallback
      navigate('/home', { replace: true });
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Mark onboarding as completed
    localStorage.setItem('onboarding_completed', 'true');
    
    // Navigate to home page
    navigate('/home', { replace: true });
  };

  // Show loading while checking status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=''>
        {currentStep !== 3 && <OnboadingHeader step={currentStep} setPrev={prevStep}/>}
        {currentStep === 1 && <OnboadingReview setStep={nextStep}/>}
        {/* {currentStep === 2 && <Language setStep={nextStep}/>} */}
        {currentStep === 2 && <Interests setStep={nextStep}/>}
        {/* {currentStep === 4 && <ProfilePhoto setStep={nextStep}/>} */}
        {currentStep === 3 && <OnboadingComplete setStep={completeOnboarding}/>}
      </div>
    </>
  )
}

export default Onboading