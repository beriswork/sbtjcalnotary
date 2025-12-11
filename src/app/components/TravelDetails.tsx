'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';
import { calculateDistance } from '../utils/calculatorUtils';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface TravelDetailsProps {
  onDistanceCalculated: (distance: number, duration: number) => void;
}

export const TravelDetails = ({ onDistanceCalculated }: TravelDetailsProps) => {
  const startLocationRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const [travelFee, setTravelFee] = useState<string>('');
  const [travelTime, setTravelTime] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const { credits, userEmail, decrementCredits, isDemoAccount } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startAutocomplete: any;
    let destinationAutocomplete: any;
    let checkTimer: NodeJS.Timeout;

    const initAutocomplete = () => {
      if (!startLocationRef.current || !destinationRef.current) return;
      if (!window.google?.maps?.places) return;

      try {
        startAutocomplete = new window.google.maps.places.Autocomplete(startLocationRef.current, {
          types: ['address']
        });

        destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationRef.current, {
          types: ['address']
        });
        
        setMapsLoaded(true);
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    checkTimer = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(checkTimer);
        initAutocomplete();
      }
    }, 100);

    // Timeout after 10 seconds if maps doesn't load
    const timeoutTimer = setTimeout(() => {
      clearInterval(checkTimer);
      if (!mapsLoaded && !window.google?.maps?.places) {
        console.warn('Google Maps API failed to load within 10s');
      }
    }, 10000);

    return () => {
      clearInterval(checkTimer);
      clearTimeout(timeoutTimer);
      if (startAutocomplete) {
        window.google?.maps?.event.clearInstanceListeners(startAutocomplete);
      }
      if (destinationAutocomplete) {
        window.google?.maps?.event.clearInstanceListeners(destinationAutocomplete);
      }
    };
  }, []);

  const handleCalculateDistance = async () => {
    if (!userEmail) {
      alert('User email not found. Please try logging in again.');
      return;
    }

    if (credits <= 0) {
      alert('Your credits are exhausted. To recharge your credits, please email us at support@solutionsbytj.com');
      return;
    }

    if (!startLocationRef.current?.value || !destinationRef.current?.value) {
      alert('Please enter both start location and destination.');
      return;
    }

    setIsCalculating(true);

    try {
      // Skip API check for demo account since it's local
      if (!isDemoAccount) {
        const creditResponse = await fetch(`/api/user/credits?email=${encodeURIComponent(userEmail)}`);
        const creditData = await creditResponse.json();
        
        if (creditData.success && creditData.credits <= 0) {
          alert('Your credits are exhausted. To recharge your credits, please email us at support@solutionsbytj.com');
          setIsCalculating(false);
          return;
        }
      }

      const response = await calculateDistance(
        startLocationRef.current.value,
        destinationRef.current.value
      );

      const element = response.rows[0].elements[0];
      
      if (element.status !== 'OK') {
        throw new Error('Unable to find a route between these locations.');
      }

      const distanceInMiles = (element.distance.value / 1609.344).toFixed(2);
      const durationInMinutes = Math.ceil(element.duration.value / 60);

      setTravelFee(distanceInMiles);
      setTravelTime(durationInMinutes.toString());
      onDistanceCalculated(parseFloat(distanceInMiles), durationInMinutes);

      await decrementCredits();

      alert(
        `Distance: ${element.distance.text}\n` +
        `Estimated travel time: ${element.duration.text}`
      );

    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error calculating distance. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className={styles.calculatorSection}>
      <div className={styles.sectionHeader}>
        <h2>
          <Navigation className={styles.sectionIcon} />
          Travel Calculation
        </h2>
      </div>
      
      <div className={styles.scrollableContent}>
        <div className="grid gap-4">
          <div className={styles.inputGroup}>
            <label className={styles.label}>Start Location</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                ref={startLocationRef}
                placeholder={mapsLoaded ? "Enter start address" : "Loading Google Maps..."}
                className={styles.locationInput}
                disabled={credits <= 0 || !mapsLoaded}
              />
              <MapPin className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Destination</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                ref={destinationRef}
                placeholder={mapsLoaded ? "Enter destination address" : "Loading Google Maps..."}
                className={styles.locationInput}
                disabled={credits <= 0 || !mapsLoaded}
              />
              <MapPin className={styles.inputIcon} />
            </div>
          </div>

          <button 
            onClick={handleCalculateDistance} 
            className={styles.secondaryButton}
            disabled={isCalculating || credits <= 0 || !mapsLoaded}
          >
            {!mapsLoaded ? 'Loading Maps...' : isCalculating ? 'Calculating...' : credits <= 0 ? 'No Credits Available' : 'Calculate Distance & Time'}
          </button>

          <div className={styles.grid2Col}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Distance (miles)</label>
              <input
                type="number"
                value={travelFee}
                readOnly
                placeholder="0"
                className={styles.numberInput}
                style={{ backgroundColor: '#f8fafc' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Time (minutes)</label>
              <input
                type="number"
                value={travelTime}
                readOnly
                placeholder="0"
                className={styles.numberInput}
                style={{ backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};