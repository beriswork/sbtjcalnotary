'use client';

import { ChangeEvent } from 'react';
import styles from '../page.module.css';
import { Briefcase, FileText, Users, Clock, Printer } from 'lucide-react';

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
    onChange(e);
  };

  return (
    <div className={styles.calculatorSection}>
      <div className={styles.sectionHeader}>
        <h2>
          <Briefcase className={styles.sectionIcon} />
          Job Specifics
        </h2>
      </div>
      
      <div className={styles.scrollableContent}>
        <div className="grid gap-4">
          <div className={styles.inputGroup}>
            <label htmlFor="numStamps" className={styles.label}>Number of Stamps</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="numStamps"
                min="0"
                value={values.numStamps === 0 ? '' : values.numStamps}
                placeholder="e.g. 1"
                onChange={handleInputChange}
                className={styles.numberInput}
              />
              <FileText className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="numWitnesses" className={styles.label}>Witnesses Needed</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="numWitnesses"
                min="0"
                value={values.numWitnesses === 0 ? '' : values.numWitnesses}
                placeholder="e.g. 0"
                onChange={handleInputChange}
                className={styles.numberInput}
              />
              <Users className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="numAddlSigners" className={styles.label}>Additional Signers</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="numAddlSigners"
                min="0"
                value={values.numAddlSigners === 0 ? '' : values.numAddlSigners}
                placeholder="e.g. 0"
                onChange={handleInputChange}
                className={styles.numberInput}
              />
              <Users className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="apptTime" className={styles.label}>Appointment Time (min)</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="apptTime"
                min="0"
                value={values.apptTime === 0 ? '' : values.apptTime}
                placeholder="e.g. 30"
                onChange={handleInputChange}
                className={styles.numberInput}
              />
              <Clock className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="numPrintScans" className={styles.label}>Prints & Scans</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                id="numPrintScans"
                min="0"
                value={values.numPrintScans === 0 ? '' : values.numPrintScans}
                placeholder="e.g. 0"
                onChange={handleInputChange}
                className={styles.numberInput}
              />
              <Printer className={styles.inputIcon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};