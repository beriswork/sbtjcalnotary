declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class places {
    static Autocomplete: {
      new (
        inputField: HTMLInputElement,
        opts?: AutocompleteOptions
      ): google.maps.places.Autocomplete;
    };
  }

  interface AutocompleteOptions {
    types?: string[];
  }

  namespace places {
    class Autocomplete {
      addListener(eventName: string, handler: Function): void;
      getPlace(): any;
    }
  }

  interface DistanceMatrixResponse {
    rows: {
      elements: {
        status: string;
        duration: {
          text: string;
          value: number;
        };
        distance: {
          text: string;
          value: number;
        };
      }[];
    }[];
    status: string;
  }

  type DistanceMatrixStatus = 'OK' | 'INVALID_REQUEST' | 'MAX_ELEMENTS_EXCEEDED' | 
    'MAX_DIMENSIONS_EXCEEDED' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 
    'ZERO_RESULTS';

  namespace event {
    function clearInstanceListeners(instance: any): void;
  }
} 