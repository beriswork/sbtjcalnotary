'use client';

import { useState } from 'react';
import { FeeData } from '../types';
import { generatePDF, getLastGeneratedPdf } from '../utils/pdfGenerator';
import { EmailPopup } from './EmailPopup';
import styles from '../page.module.css';

export const FeeResult = ({ feeData }: { feeData: FeeData }) => {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePDF(feeData);
    } catch (error) {
      console.error('Error in handleDownloadPdf:', error);
      // If error is about library not loading, provide helpful message
      if (error instanceof Error && error.message.includes('failed to load')) {
        alert('PDF library is still loading. Please wait a few seconds and try again, or refresh the page.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = (email: string) => {
    const pdfBlob = getLastGeneratedPdf();
    
    if (!pdfBlob) {
      alert('Please generate the PDF first by clicking "Download PDF" button.');
      setShowEmailPopup(false);
      return;
    }

    // Create a detailed email with bill information
    const mailtoLink = `mailto:${email}?subject=Notary Bill&body=Please find your notary bill details below:%0D%0A%0D%0ATotal Fees: $${feeData.totalFees.toFixed(2)}%0D%0A%0D%0ABreakdown:%0D%0A- Stamp Fees: $${feeData.stampFees.toFixed(2)}%0D%0A- Witness Fees: $${feeData.witnessFees.toFixed(2)}%0D%0A- Additional Signer Fees: $${feeData.addlSignerFees.toFixed(2)}%0D%0A- Travel Fees: $${feeData.totalTravelFees.toFixed(2)}%0D%0A- Appointment Time Fees: $${feeData.apptTimeFees.toFixed(2)}%0D%0A- Printing/Scanning Fees: $${feeData.printingScanningFees.toFixed(2)}%0D%0A%0D%0ANote: Please download the PDF and attach it manually to this email.`;
    
    window.location.href = mailtoLink;
  };

  return (
    <div className={styles.resultContainer}>
      <h2 className={styles.totalFees}>Total Fees: ${feeData.totalFees.toFixed(2)}</h2>
      <div className={styles.feeBreakdown}>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Stamp Fees</span>
          <span className={styles.feeAmount}>${feeData.stampFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Witness Fees</span>
          <span className={styles.feeAmount}>${feeData.witnessFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Additional Signer Fees</span>
          <span className={styles.feeAmount}>${feeData.addlSignerFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <div className={styles.feeLabelContainer}>
            <span className={styles.feeLabel}>Travel Fees</span>
            <span className={styles.feeAmount}>${feeData.totalTravelFees.toFixed(2)}</span>
          </div>
          <div className={styles.feeSubitem}>
            <div className={styles.feeSubitemRow}>
              <div className={styles.feeSubitemDetail}>
                <span>Distance:</span>
                <span>${feeData.travelDistanceFees.toFixed(2)}</span>
              </div>
              <div className={styles.feeSubitemDetail}>
                <span>Time:</span>
                <span>${feeData.travelTimeFees.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Appointment Time Fees</span>
          <span className={styles.feeAmount}>${feeData.apptTimeFees.toFixed(2)}</span>
        </div>
        <div className={styles.feeItem}>
          <span className={styles.feeLabel}>Printing/Scanning Fees</span>
          <span className={styles.feeAmount}>${feeData.printingScanningFees.toFixed(2)}</span>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          onClick={handleDownloadPdf}
          className={styles.downloadButton}
          disabled={isGeneratingPdf}
          style={{
            opacity: isGeneratingPdf ? 0.6 : 1,
            cursor: isGeneratingPdf ? 'not-allowed' : 'pointer'
          }}
        >
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
        
        <button
          onClick={() => setShowEmailPopup(true)}
          className={styles.shareButton}
        >
          <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Share the bill with client
        </button>
      </div>

      {showEmailPopup && (
        <EmailPopup
          onClose={() => setShowEmailPopup(false)}
          onSubmit={handleShare}
        />
      )}
    </div>
  );
}; 