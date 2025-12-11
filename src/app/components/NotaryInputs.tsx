'use client';

import { ChangeEvent } from 'react';
import styles from '../page.module.css';
import { DollarSign, FileText, Users, Printer, Clock } from 'lucide-react';

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
    onChange(e);
  };

  return (
    <div className={styles.calculatorSection}>
      <div className={styles.sectionHeader}>
        <h2>
          <DollarSign className={styles.sectionIcon} />
          Cost Configuration
        </h2>
      </div>
      
      <div className={styles.scrollableContent}>
        <div className="grid gap-4">
          <div className={styles.inputGroup}>
            <label htmlFor="fixedStampFee" className={styles.label}>Fixed Stamp Fee ($)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="fixedStampFee"
                step="0.01"
                value={values.fixedStampFee === 0 ? '' : values.fixedStampFee}
                placeholder="e.g. 15"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="additionalStampFee" className={styles.label}>Additional Stamp Fee ($)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="additionalStampFee"
                step="0.01"
                value={values.additionalStampFee === 0 ? '' : values.additionalStampFee}
                placeholder="e.g. 5"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="irsMileage" className={styles.label}>IRS Mileage Rate ($/mile)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="irsMileage"
                step="0.001"
                value={values.irsMileage === 0 ? '' : values.irsMileage}
                placeholder="e.g. 0.67"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="hourlyRate" className={styles.label}>Hourly Rate ($)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="hourlyRate"
                step="0.01"
                value={values.hourlyRate === 0 ? '' : values.hourlyRate}
                placeholder="e.g. 50"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="witnessFee" className={styles.label}>Witness Fee ($)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="witnessFee"
                step="0.01"
                value={values.witnessFee === 0 ? '' : values.witnessFee}
                placeholder="e.g. 25"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="addlSignerFee" className={styles.label}>Add'l Signer Fee ($)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="addlSignerFee"
                step="0.01"
                value={values.addlSignerFee === 0 ? '' : values.addlSignerFee}
                placeholder="e.g. 10"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="printScanFees" className={styles.label}>Print/Scan Fees ($)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="printScanFees"
                step="0.01"
                value={values.printScanFees === 0 ? '' : values.printScanFees}
                placeholder="e.g. 1"
                onChange={handleInputChange}
                min="0"
                className={styles.numberInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};