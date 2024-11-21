import { DistanceMatrixResponse } from '../types';

export const calculateDistance = async (
  origin: string,
  destination: string
): Promise<DistanceMatrixResponse> => {
  if (!origin || !destination) {
    throw new Error('Please enter both start location and destination.');
  }

  if (typeof window === 'undefined' || !window.google) {
    throw new Error('Google Maps is not loaded');
  }

  try {
    const service = new window.google.maps.DistanceMatrixService();
    
    const request = {
      origins: [origin],
      destinations: [destination],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    };

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        request,
        (
          response: google.maps.DistanceMatrixResponse,
          status: google.maps.DistanceMatrixStatus
        ) => {
          if (status === 'OK' && response) {
            if (response.rows[0].elements[0].status === 'OK') {
              resolve(response as DistanceMatrixResponse);
            } else {
              reject(new Error('No route found between these locations.'));
            }
          } else {
            reject(new Error(`Distance Matrix API error: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in distance calculation:', error);
    throw error;
  }
};

// Helper function to convert duration to minutes
export const convertToMinutes = (duration: string): number => {
  const hours = duration.match(/(\d+)\s*hour/);
  const minutes = duration.match(/(\d+)\s*min/);
  
  let totalMinutes = 0;
  if (hours) totalMinutes += parseInt(hours[1]) * 60;
  if (minutes) totalMinutes += parseInt(minutes[1]);
  
  return totalMinutes;
};

// Add other utility functions... 