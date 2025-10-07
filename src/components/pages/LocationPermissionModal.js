// LocationPermissionModal.js
import React from 'react';
import { RiMapPinLine, RiRefreshLine, RiSettingsLine, RiInformationLine } from 'react-icons/ri';

const LocationPermissionModal = ({ show, onRetry, onCancel, loading, permissionStatus, permissionDenied, error }) => {
  if (!show) return null;

  const isBlocked =
    permissionDenied ||
    permissionStatus === 'denied' ||
    (typeof error === 'string' && /denied|blocked/i.test(error));

  const getInstructions = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      return (
        <div className="text-left text-xs text-gray-600 bg-gray-50 p-3 rounded mt-4">
          <p className="font-medium mb-2">Chrome Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the location icon in the address bar</li>
            <li>Select "Always allow on this site"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      );
    } else if (userAgent.includes('Firefox')) {
      return (
        <div className="text-left text-xs text-gray-600 bg-gray-50 p-3 rounded mt-4">
          <p className="font-medium mb-2">Firefox Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the shield icon in the address bar</li>
            <li>Click "Allow Location Access"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      );
    } else if (userAgent.includes('Safari')) {
      return (
        <div className="text-left text-xs text-gray-600 bg-gray-50 p-3 rounded mt-4">
          <p className="font-medium mb-2">Safari Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to Safari → Settings → Websites</li>
            <li>Click "Location" in the left sidebar</li>
            <li>Set this website to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      );
    }
    
    return (
      <div className="text-left text-xs text-gray-600 bg-gray-50 p-3 rounded mt-4">
        <p className="font-medium mb-2">General Instructions:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Look for a location icon in your address bar</li>
          <li>Click it and select "Allow"</li>
          <li>Refresh the page if needed</li>
        </ol>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6 text-center">
        <div className="mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isBlocked ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            {isBlocked ? (
              <RiSettingsLine className="w-8 h-8 text-orange-500" />
            ) : (
              <RiMapPinLine className="w-8 h-8 text-blue-500" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {isBlocked ? 'Location Access Blocked' : 'Location Access Required'}
          </h3>
          
          {isBlocked ? (
            <div>
              <p className="text-gray-600 text-sm mb-2">
                Location access has been blocked in your browser. To enable it:
              </p>
              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg mb-4">
                <RiInformationLine className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-blue-700 text-xs text-left">
                  Look for a location icon (📍) in your browser's address bar and click it to allow location access.
                </p>
              </div>
              {getInstructions()}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 text-sm mb-4">
                To show nearby users and provide map functionality, we need access to your location.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                Your location is only used to display the map and find nearby users. We respect your privacy.
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {isBlocked ? (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <RiRefreshLine className="w-4 h-4" />
              Refresh Page
            </button>
          ) : (
            <button
              onClick={onRetry}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <RiRefreshLine className="w-4 h-4" />
                  Allow Location Access
                </>
              )}
            </button>
          )}
          
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200"
          >
            Use Without Location
          </button>
        </div>
        
        {!isBlocked && (
          <p className="text-xs text-gray-400 mt-4">
            If you don't see a permission dialog, check your browser's location settings
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationPermissionModal;