'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../page.module.css';
import { calculateDistance } from '../utils/calculatorUtils';
import { useAuth } from '../context/AuthContext';

interface TravelDetailsProps {
  onDistanceCalculated: (distance: number, duration: number) => void;
}

export const TravelDetails = ({ onDistanceCalculated }: TravelDetailsProps) => {
  const startLocationRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const [travelFee, setTravelFee] = useState<string>('');
  const [travelTime, setTravelTime] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const { credits, userEmail, decrementCredits } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let startAutocomplete: any;
    let destinationAutocomplete: any;

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
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    const timer = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(timer);
        initAutocomplete();
      }
    }, 100);

    return () => {
      clearInterval(timer);
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
      const creditResponse = await fetch(`/api/user/credits?email=${encodeURIComponent(userEmail)}`);
      const creditData = await creditResponse.json();
      
      if (creditData.success && creditData.credits <= 0) {
        alert('Your credits are exhausted. To recharge your credits, please email us at support@solutionsbytj.com');
        setIsCalculating(false);
        return;
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

      // Update UI
      setTravelFee(distanceInMiles);
      setTravelTime(durationInMinutes.toString());
      onDistanceCalculated(parseFloat(distanceInMiles), durationInMinutes);

      // Update credits in backend and UI
      const updateResponse = await fetch('/api/user/update-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (updateResponse.ok) {
        const data = await updateResponse.json();
        if (data.success) {
          decrementCredits();
          console.log(`[Credit Update] User: ${userEmail}, Credits remaining: ${data.newCredits}`);
          
          if (data.newCredits <= 0) {
            alert('You have used all your credits. To recharge your credits, please email us at support@solutionsbytj.com');
          }
        }
      }

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
      <h2>Travel Details</h2>
      <label>
        Start Location
        <input
          type="text"
          ref={startLocationRef}
          placeholder="Enter start location"
          className={styles.locationInput}
          disabled={credits <= 0}
        />
      </label>
      <label>
        Destination
        <input
          type="text"
          ref={destinationRef}
          placeholder="Enter destination"
          className={styles.locationInput}
          disabled={credits <= 0}
        />
      </label>
      <button 
        onClick={handleCalculateDistance} 
        className={`secondary-button ${credits <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isCalculating || credits <= 0}
      >
        {isCalculating ? 'Calculating...' : credits <= 0 ? 'No Credits Available' : 'Calculate Distance and Time'}
      </button>
      <label>
        Travel Fee (miles)
        <input
          type="number"
          id="travelFee"
          value={travelFee}
          readOnly
          placeholder={credits <= 0 ? 'Add credits to calculate' : 'Calculated miles'}
          className={styles.numberInput}
        />
      </label>
      <label>
        Travel Time (minutes)
        <input
          type="number"
          id="travelTime"
          value={travelTime}
          readOnly
          placeholder={credits <= 0 ? 'Add credits to calculate' : 'Calculated time'}
          className={styles.numberInput}
        />
      </label>
    </div>
  );
}; 