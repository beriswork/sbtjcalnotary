'use client';

import { ChangeEvent } from 'react';
import styles from '../page.module.css';

interface JobDetailsProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  values: {
    numStamps: number;
    numWitnesses: number;
    numAddlSigners: number;
    apptTime: number;
    numPrintScans: number;
  };
}

export const JobDetails = ({ onChange, values }: JobDetailsProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    console.log('Job Details input change:', {
      id: e.target.id,
      value
    });
    
    onChange(e);
  };

  return (
    <div className={styles.calculatorSection}>
      <h2>Job Details</h2>
      <label>
        # of Stamps
        <input
          type="number"
          id="numStamps"
          min="0"
          value={values.numStamps === 0 ? '' : values.numStamps}
          placeholder="Enter number"
          onChange={handleInputChange}
          className={styles.numberInput}
        />
      </label>
      <label>
        # of Witnesses Needed
        <input
          type="number"
          id="numWitnesses"
          min="0"
          value={values.numWitnesses === 0 ? '' : values.numWitnesses}
          placeholder="Enter number"
          onChange={handleInputChange}
          className={styles.numberInput}
        />
      </label>
      <label>
        # of Add'l Signers
        <input
          type="number"
          id="numAddlSigners"
          min="0"
          value={values.numAddlSigners === 0 ? '' : values.numAddlSigners}
          placeholder="Enter number"
          onChange={handleInputChange}
          className={styles.numberInput}
        />
      </label>
      <label>
        Appt Time/Expertise (minutes)
        <input
          type="number"
          id="apptTime"
          min="0"
          value={values.apptTime === 0 ? '' : values.apptTime}
          placeholder="Enter time"
          onChange={handleInputChange}
          className={styles.numberInput}
        />
      </label>
      <label>
        # of Prints and Scans
        <input
          type="number"
          id="numPrintScans"
          min="0"
          value={values.numPrintScans === 0 ? '' : values.numPrintScans}
          placeholder="Enter number"
          onChange={handleInputChange}
          className={styles.numberInput}
        />
      </label>
    </div>
  );
}; 