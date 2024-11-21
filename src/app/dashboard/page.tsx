'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { NotaryInputs } from '../components/NotaryInputs';
import { TravelDetails } from '../components/TravelDetails';
import { JobDetails } from '../components/JobDetails';
import { FeeData, CalculatorInputs } from '../types';
import styles from '../page.module.css';
import { FeeResult } from '../components/FeeResult';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, credits, decrementCredits, userEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  

  const [inputs, setInputs] = useState<CalculatorInputs>({
    fixedStampFee: 0,
    additionalStampFee: 0,
    irsMileage: 0.67,
    hourlyRate: 0,
    witnessFee: 0,
    addlSignerFee: 0,
    printScanFees: 0,
    numStamps: 0,
    numWitnesses: 0,
    numAddlSigners: 0,
    travelFee: 0,
    travelTime: 0,
    apptTime: 0,
    numPrintScans: 0
  });

  const [feeData, setFeeData] = useState<FeeData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    console.log(`Input change for ${id}:`, {
      rawValue: value,
      numericValue
    });
    
    setInputs(prev => {
      const newInputs = {
        ...prev,
        [id]: numericValue
      };
      console.log('Updated inputs state:', newInputs);
      return newInputs;
    });
  };

  const handleDistanceCalculated = (distance: number, duration: number) => {
    if (credits <= 0) {
      alert('You have no credits left. Please contact support to add more credits.');
      return;
    }
    
    setInputs(prev => ({
      ...prev,
      travelFee: distance,
      travelTime: duration
    }));
    
    decrementCredits();
  };

  const calculateFees = () => {
    // Log all inputs before calculation
    console.log('Starting calculation with inputs:', JSON.stringify(inputs, null, 2));

    const {
      fixedStampFee,
      additionalStampFee,
      numStamps,
      irsMileage,
      hourlyRate,
      witnessFee,
      addlSignerFee,
      travelFee,
      travelTime,
      apptTime,
      printScanFees,
      numWitnesses,
      numAddlSigners,
      numPrintScans
    } = inputs;

    // Calculate stamp fees
    let stampFees = 0;
    if (numStamps > 0) {
      stampFees = fixedStampFee + ((numStamps - 1) * additionalStampFee);
    }

    console.log('Stamp fee calculation:', {
      numStamps,
      fixedStampFee,
      additionalStampFee,
      stampFees
    });

    // Calculate witness fees
    const witnessFees = Number(numWitnesses) * Number(witnessFee);
    console.log('Witness fees:', {
      numWitnesses,
      witnessFee,
      total: witnessFees
    });

    // Calculate additional signer fees
    const addlSignerFees = Number(numAddlSigners) * Number(addlSignerFee);
    console.log('Additional signer fees:', {
      numAddlSigners,
      addlSignerFee,
      total: addlSignerFees
    });
    
    // Calculate travel fees (round trip)
    const travelDistanceFees = (Number(travelFee) * 2) * Number(irsMileage);
    const travelTimeFees = (Number(travelTime) / 60) * Number(hourlyRate) * 2;
    const totalTravelFees = travelDistanceFees + travelTimeFees;
    
    // Calculate appointment time fees
    const apptTimeFees = (Number(apptTime) / 60) * Number(hourlyRate);
    
    // Calculate printing/scanning fees
    const printingScanningFees = Number(numPrintScans) * Number(printScanFees);

    // Calculate total fees
    const totalFees = stampFees + 
                     witnessFees + 
                     addlSignerFees + 
                     totalTravelFees + 
                     apptTimeFees + 
                     printingScanningFees;

    console.log('Final calculation results:', {
      stampFees,
      witnessFees,
      addlSignerFees,
      travelDistanceFees,
      travelTimeFees,
      totalTravelFees,
      apptTimeFees,
      printingScanningFees,
      totalFees
    });

    const newFeeData = {
      totalFees,
      stampFees,
      witnessFees,
      addlSignerFees,
      totalTravelFees,
      travelDistanceFees,
      travelTimeFees,
      apptTimeFees,
      printingScanningFees
    };

    setFeeData(newFeeData);
    window.feeData = newFeeData;
  };

  useEffect(() => {
    const session = sessionStorage.getItem('user_session');
    if (session) {
      console.log('Dashboard: Found active session');
    } else {
      console.log('Dashboard: No active session');
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.unauthorizedMessage}>
          <h1>Access Denied</h1>
          <p>Please <a href="/login" style={{ color: '#0052CC', textDecoration: 'underline' }}>log in</a> to access the calculator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Script
        id="google-maps"
        strategy="afterInteractive"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
      />
      <Script
        id="jspdf"
        strategy="afterInteractive"
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        onLoad={() => console.log('jsPDF loaded')}
      />
      <Script
        id="jspdf-autotable"
        strategy="afterInteractive"
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.20/jspdf.plugin.autotable.min.js"
        onLoad={() => console.log('jsPDF AutoTable loaded')}
      />
      
      <main className={styles.main}>
        <div className={styles.calculatorGrid}>
          <NotaryInputs onChange={handleInputChange} values={inputs} />
          <TravelDetails onDistanceCalculated={handleDistanceCalculated} />
          <JobDetails onChange={handleInputChange} values={inputs} />
        </div>

        <div className={styles.banner}>
          <span>Click here to calculate the fee immediately 👉</span>
          <button onClick={calculateFees} className="primary-button">
            CALCULATE
          </button>
        </div>

        {feeData && <FeeResult feeData={feeData} />}
      </main>
    </div>
  );
} 