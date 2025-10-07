// googlePlacesService.js - Production Version
class GooglePlacesService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.service = null;
        this.initializeService();
    }

    initializeService() {
        try {
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                console.error('Google Maps API not loaded');
                return;
            }

            const dummyDiv = document.createElement('div');
            this.service = new window.google.maps.places.PlacesService(dummyDiv);
        } catch (error) {
            console.error('Error initializing Google Places Service:', error);
        }
    }

    getPlacePhotos(placeId) {
        return new Promise((resolve, reject) => {
            if (!this.service) {
                reject(new Error('Google Places service not initialized'));
                return;
            }

            if (!placeId || placeId.trim() === '') {
                reject(new Error('Valid place ID is required'));
                return;
            }

            const request = {
                placeId: placeId.trim(),
                fields: ['photos', 'name']
            };

            this.service.getDetails(request, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    if (place && place.photos && place.photos.length > 0) {
                        try {
                            const photoUrl = place.photos[0].getUrl({
                                maxWidth: 400,
                                maxHeight: 400
                            });
                            resolve([photoUrl]);
                        } catch (photoError) {
                            console.error('Error generating photo URL:', photoError);
                            reject(photoError);
                        }
                    } else {
                        resolve([]);
                    }
                } else {
                    const errorMessages = {
                        'INVALID_REQUEST': 'Invalid request - check place ID format',
                        'NOT_FOUND': 'Place not found - place ID may be invalid',
                        'OVER_QUERY_LIMIT': 'API quota exceeded',
                        'REQUEST_DENIED': 'API request denied - check API key and permissions',
                        'UNKNOWN_ERROR': 'Unknown error occurred',
                        'ZERO_RESULTS': 'No results found'
                    };
                    
                    const errorMessage = errorMessages[status] || `Places service failed with status: ${status}`;
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                }
            });
        });
    }

    getAllPlacePhotos(placeId, maxPhotos = 5) {
        return new Promise((resolve, reject) => {
            if (!this.service) {
                reject(new Error('Google Places service not initialized'));
                return;
            }

            const request = {
                placeId: placeId,
                fields: ['photos']
            };

            this.service.getDetails(request, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    if (place.photos && place.photos.length > 0) {
                        const photoUrls = place.photos
                            .slice(0, maxPhotos)
                            .map(photo => photo.getUrl({
                                maxWidth: 400,
                                maxHeight: 400
                            }));
                        resolve(photoUrls);
                    } else {
                        resolve([]);
                    }
                } else {
                    reject(new Error(`Places service failed with status: ${status}`));
                }
            });
        });
    }
}

let placesService = null;

export const initGooglePlaces = (apiKey) => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
            try {
                placesService = new GooglePlacesService(apiKey);
                resolve(placesService);
            } catch (error) {
                reject(error);
            }
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => {
                try {
                    placesService = new GooglePlacesService(apiKey);
                    resolve(placesService);
                } catch (error) {
                    reject(error);
                }
            });
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            try {
                placesService = new GooglePlacesService(apiKey);
                resolve(placesService);
            } catch (error) {
                reject(error);
            }
        };

        script.onerror = (error) => {
            reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
    });
};

const getPlaceImageUrls = async (placeId) => {
    if (!placesService) {
        throw new Error('Google Places service not initialized');
    }

    if (!placeId || placeId.trim() === '') {
        throw new Error('Invalid place ID provided');
    }

    try {
        const photos = await placesService.getPlacePhotos(placeId);
        return photos;
    } catch (error) {
        console.error('Error in getPlaceImageUrls:', error);
        return [];
    }
};

export default getPlaceImageUrls;