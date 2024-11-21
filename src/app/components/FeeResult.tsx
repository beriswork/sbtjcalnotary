'use client';

import { FeeData } from '../types';
import { generatePDF } from '../utils/pdfGenerator';
import styles from '../page.module.css';

interface FeeResultProps {
  feeData: FeeData | null;
}

export const FeeResult = ({ feeData }: FeeResultProps) => {
  if (!feeData) return null;

  const handleDownloadPDF = () => {
    try {
      console.log('Generating PDF with data:', feeData);
      generatePDF(feeData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className={`${styles.resultContainer} show`}>
      <h2>Total Fees: ${feeData.totalFees.toFixed(2)}</h2>
      <div className={styles.feeBreakdown}>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Stamp Fees:</span>
          <span>${feeData.stampFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Witness Fees:</span>
          <span>${feeData.witnessFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Additional Signer Fees:</span>
          <span>${feeData.addlSignerFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Travel Fees:</span>
          <span>${feeData.totalTravelFees.toFixed(2)}</span>
          <div className={styles.feeSubitem}>
            <span>Distance: ${feeData.travelDistanceFees.toFixed(2)}</span>
            <span>Time: ${feeData.travelTimeFees.toFixed(2)}</span>
          </div>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Appointment Time Fees:</span>
          <span>${feeData.apptTimeFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Printing/Scanning Fees:</span>
          <span>${feeData.printingScanningFees.toFixed(2)}</span>
        </div>
      </div>
      <button onClick={handleDownloadPDF} className={styles.downloadButton}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download PDF
      </button>
    </div>
  );
}; 