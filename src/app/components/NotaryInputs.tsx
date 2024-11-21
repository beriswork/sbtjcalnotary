'use client';

import { ChangeEvent } from 'react';
import styles from '../page.module.css';

interface NotaryInputsProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  values: {
    fixedStampFee: number;
    additionalStampFee: number;
    irsMileage: number;
    hourlyRate: number;
    witnessFee: number;
    addlSignerFee: number;
    printScanFees: number;
  };
}

export const NotaryInputs = ({ onChange, values }: NotaryInputsProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    console.log('NotaryInputs change:', {
      id: e.target.id,
      value
    });
    
    onChange(e);
  };

  return (
    <div className={styles.calculatorSection}>
      <h2>Notary Inputs</h2>
      <label>
        Fixed Stamp Fee ($)
        <input
          type="number"
          id="fixedStampFee"
          step="0.01"
          value={values.fixedStampFee === 0 ? '' : values.fixedStampFee}
          placeholder="Enter fixed fee"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
      <label>
        Additional Stamp Fee ($)
        <input
          type="number"
          id="additionalStampFee"
          step="0.01"
          value={values.additionalStampFee === 0 ? '' : values.additionalStampFee}
          placeholder="Enter additional fee"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
      <label>
        IRS Mileage ($/mile)
        <input
          type="number"
          id="irsMileage"
          step="0.01"
          value={values.irsMileage === 0 ? '' : values.irsMileage}
          placeholder="0.670"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
      <label>
        Hourly Rate ($)
        <input
          type="number"
          id="hourlyRate"
          step="0.01"
          value={values.hourlyRate === 0 ? '' : values.hourlyRate}
          placeholder="Enter rate"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
      <label>
        Witness Fee ($)
        <input
          type="number"
          id="witnessFee"
          step="0.01"
          value={values.witnessFee === 0 ? '' : values.witnessFee}
          placeholder="Enter fee"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
      <label>
        Add'l Signer Fee ($)
        <input
          type="number"
          id="addlSignerFee"
          step="0.01"
          value={values.addlSignerFee === 0 ? '' : values.addlSignerFee}
          placeholder="Enter fee"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
      <label>
        Print/Scan Fees ($)
        <input
          type="number"
          id="printScanFees"
          step="0.01"
          value={values.printScanFees === 0 ? '' : values.printScanFees}
          placeholder="Enter fees"
          onChange={handleInputChange}
          min="0"
          className={styles.numberInput}
        />
      </label>
    </div>
  );
}; 