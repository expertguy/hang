/* eslint-disable no-unused-vars */
import 'bootstrap/dist/css/bootstrap.min.css'
import './components/style/main.css'
import './components/style/main.scss'
import './components/style/color.css'
import './components/style/universal.css'
import './components/style/fonts.css'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import Routing from './components/routes/routes'
import { Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import 'remixicon/fonts/remixicon.css'
import { ToastContainer } from 'react-toastify'
import Splash from './components/pages/auth/splash'
import { SimplePwaModal } from './components/pages/pwaInstallModal';
import { IosPwaInstructionsModal } from './components/pages/pwaInstallModalIOS';
import useCheckInSync from './utils/hooks/useCheckInSync'

function App () {
   useCheckInSync();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [showPwaModal, setShowPwaModal] = useState(() => {
    // Check if PWA is installed
    const isInstalled = !!localStorage.getItem('hang_pwa_installed');
    
    // Check if PWA was dismissed in this session
    const dismissedInSession = !!sessionStorage.getItem('hang_pwa_dismissed_session');
    
    // Check if permanently dismissed
    const permanentlyDismissed = !!localStorage.getItem('hang_pwa_dismissed');
    
    // Only show modal if not installed, not dismissed in session, and not permanently dismissed
    return !isInstalled && !dismissedInSession && !permanentlyDismissed;
  });
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  // Removed: const [installPrompt, setInstallPrompt] = useState(null);
  // Removed: const [showAddToHome, setShowAddToHome] = useState(false);
  // const [siteData, setSiteData] = useState(null);




 useEffect(() => {
    // Method 1: Prevent zoom with keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent Ctrl/Cmd + Plus/Minus/0 (zoom shortcuts)
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
        e.preventDefault();
      }
    };

    // Method 2: Prevent zoom with mouse wheel + Ctrl/Cmd
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    // Method 3: Prevent pinch-to-zoom on touch devices
    const handleTouchStart = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Method 4: Set viewport meta tag dynamically
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (viewportMeta) {
      // Update existing viewport meta tag
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no'
      );
    } else {
      // Create new viewport meta tag
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
      document.head.appendChild(viewportMeta);
    }

    return () => {
      // Optional: Reset viewport on component unmount
      if (viewportMeta && viewportMeta.parentNode) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('Service Worker registered:', registration.scope))
          .catch(error => console.error('Service Worker registration failed:', error));
      });
    }
  }, []);
  // Detect beforeinstallprompt event (PWA install trigger)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Detect iOS (iPhone/iPad) where beforeinstallprompt is not supported
  useEffect(() => {
    const ua = window.navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isInStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone;
    const alreadyInstalled = !!localStorage.getItem('hang_pwa_installed');
    const dismissedInSession = !!sessionStorage.getItem('hang_pwa_dismissed_session');
    const permanentlyDismissed = !!localStorage.getItem('hang_pwa_dismissed');
    
    if (isIOS && !isInStandalone && !alreadyInstalled && !dismissedInSession && !permanentlyDismissed) {
      setShowIosInstructions(true);
      setShowPwaModal(false);
    }
  }, []);

  // Detect if app is already installed (any platform) and hide modals
  useEffect(() => {
    const markInstalledAndHide = () => {
      localStorage.setItem('hang_pwa_installed', '1');
      setShowPwaModal(false);
      setShowIosInstructions(false);
    };

    // 1) Display-mode standalone detection
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
    if (isStandalone) {
      markInstalledAndHide();
      return;
    }

    // 2) Chromium: check for related installed apps
    const checkRelatedApps = async () => {
      try {
        const anyNavigator = window.navigator;
        if (anyNavigator && typeof anyNavigator.getInstalledRelatedApps === 'function') {
          const related = await anyNavigator.getInstalledRelatedApps();
          if (Array.isArray(related) && related.length > 0) {
            markInstalledAndHide();
          }
        }
      } catch (_) {
        // Ignore
      }
    };
    checkRelatedApps();
  }, []);

  useEffect(() => {
    const handleAppInstalled = () => {
      localStorage.setItem('hang_pwa_installed', '1');
      setShowPwaModal(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000) // 1 second delay

    return () => clearTimeout(timer) // Cleanup timer
  }, [])

  useEffect(() => {
    const setVhUnit = () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`
      )
    }
    setVhUnit() // Initial call
    window.addEventListener('resize', setVhUnit) // Update on resize
    return () => window.removeEventListener('resize', setVhUnit) // Cleanup
  }, [])

  useEffect(() => {
    if (!showSplash) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [location, showSplash])

  const isValidMobileNav = [
    '/auth/login',
    '/auth/sign-up',
    '/post-detail',
    '/upload'
  ]

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPwaModal(false);
        localStorage.setItem('hang_pwa_installed', '1');
      }
    }
  };

  const handleClosePwaModal = () => {
    setShowPwaModal(false);
    // Only dismiss for current session, not permanently
    sessionStorage.setItem('hang_pwa_dismissed_session', '1');
  };

  const handlePermanentlyDismissPwa = () => {
    setShowPwaModal(false);
    // Permanently dismiss - won't show again even in new sessions
    localStorage.setItem('hang_pwa_dismissed', '1');
  };

  const handleCloseIosModal = () => {
    setShowIosInstructions(false);
    // Only dismiss for current session, not permanently
    sessionStorage.setItem('hang_pwa_dismissed_session', '1');
  };

  const handlePermanentlyDismissIos = () => {
    setShowIosInstructions(false);
    // Permanently dismiss - won't show again even in new sessions
    localStorage.setItem('hang_pwa_dismissed', '1');
  };

  return (
    <>
      <Suspense fallback={<Splash />}>
        <main className='mainScreen h_100vh'>
          {showSplash ? <><Splash/></> : <>
          <ToastContainer
            position='top-right'
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routing />
          {/* Show Android/Chromium install modal if eligible and not iOS */}
          <SimplePwaModal 
            open={showPwaModal && !showIosInstructions} 
            onClose={handleClosePwaModal} 
            onInstall={handleInstall} 
            showInstall={!!deferredPrompt}
            onPermanentDismiss={handlePermanentlyDismissPwa}
          />
          {/* Show iOS-specific instructions if applicable */}
          <IosPwaInstructionsModal
            open={showIosInstructions}
            onClose={handleCloseIosModal}
          />
          </>}
        </main>
      </Suspense>
    </>
  )
}

export default App