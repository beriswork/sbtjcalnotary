declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class DistanceMatrixService {
    getDistanceMatrix(
      request: DistanceMatrixRequest,
      callback: (response: DistanceMatrixResponse, status: DistanceMatrixStatus) => void
    ): void;
  }

  interface DistanceMatrixRequest {
    origins: string[];
    destinations: string[];
    travelMode: TravelMode;
    unitSystem: UnitSystem;
    avoidHighways: boolean;
    avoidTolls: boolean;
  }

  interface DistanceMatrixResponse {
    rows: {
      elements: {
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        status: string;
      }[];
    }[];
    status: string;
  }

  enum TravelMode {
    DRIVING = 'DRIVING'
  }

  enum UnitSystem {
    IMPERIAL = 'IMPERIAL'
  }

  type DistanceMatrixStatus = 'OK' | 'INVALID_REQUEST' | 'MAX_ELEMENTS_EXCEEDED' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'ZERO_RESULTS';
}

export {}; 