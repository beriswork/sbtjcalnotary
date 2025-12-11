'use client';

import { useState } from 'react';
import { FeeData } from '../types';
import { generatePDF, getLastGeneratedPdf } from '../utils/pdfGenerator';
import { EmailPopup } from './EmailPopup';
import styles from '../page.module.css';
import { Download, Share2, DollarSign, Clock, MapPin, Printer, Users, FileText } from 'lucide-react';

export const FeeResult = ({ feeData }: { feeData: FeeData }) => {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePDF(feeData);
    } catch (error) {
      console.error('Error in handleDownloadPdf:', error);
      if (error instanceof Error && error.message.includes('failed to load')) {
        alert('PDF library is still loading. Please wait a few seconds and try again, or refresh the page.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = (email: string) => {
    const subject = "Notary Fee Breakdown";
    const body = `Please find your notary bill details below:

Total Fees: $${feeData.totalFees.toFixed(2)}

Breakdown:
- Stamp Fees: $${feeData.stampFees.toFixed(2)}
- Witness Fees: $${feeData.witnessFees.toFixed(2)}
- Additional Signer Fees: $${feeData.addlSignerFees.toFixed(2)}
- Travel Fees: $${feeData.totalTravelFees.toFixed(2)}
  (Distance: $${feeData.travelDistanceFees.toFixed(2)} + Time: $${feeData.travelTimeFees.toFixed(2)})
- Appointment Time Fees: $${feeData.apptTimeFees.toFixed(2)}
- Printing/Scanning Fees: $${feeData.printingScanningFees.toFixed(2)}

Note: If you have generated a PDF bill, please attach it manually to this email.`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  return (
    <div className={styles.resultContainer}>
      <div className="flex flex-col items-center mb-8">
        <span className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Total Estimated Fees</span>
        <h2 className={styles.totalFees}>${feeData.totalFees.toFixed(2)}</h2>
      </div>

      <div className={styles.feeBreakdown}>
        <div className={styles.feeItem}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className={styles.feeLabel}>Stamp Fees</span>
          </div>
          <span className={styles.feeAmount}>${feeData.stampFees.toFixed(2)}</span>
        </div>

        <div className={styles.feeItem}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className={styles.feeLabel}>Witness Fees</span>
          </div>
          <span className={styles.feeAmount}>${feeData.witnessFees.toFixed(2)}</span>
        </div>

        <div className={styles.feeItem}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className={styles.feeLabel}>Add'l Signers</span>
          </div>
          <span className={styles.feeAmount}>${feeData.addlSignerFees.toFixed(2)}</span>
        </div>

        <div className={styles.feeItem}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <span className={styles.feeLabel}>Travel Fees</span>
          </div>
          <div className="text-right">
            <span className={styles.feeAmount}>${feeData.totalTravelFees.toFixed(2)}</span>
            <div className="text-xs text-gray-400 mt-1">
              ${feeData.travelDistanceFees.toFixed(2)} dist + ${feeData.travelTimeFees.toFixed(2)} time
            </div>
          </div>
        </div>

        <div className={styles.feeItem}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Clock className="w-5 h-5 text-pink-600" />
            </div>
            <span className={styles.feeLabel}>Time Fees</span>
          </div>
          <span className={styles.feeAmount}>${feeData.apptTimeFees.toFixed(2)}</span>
        </div>

        <div className={styles.feeItem}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Printer className="w-5 h-5 text-gray-600" />
            </div>
            <span className={styles.feeLabel}>Print/Scan</span>
          </div>
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
          {isGeneratingPdf ? (
            <svg className={styles.loadingIcon} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
        
        <button
          onClick={() => setShowEmailPopup(true)}
          className={styles.shareButton}
        >
          <Share2 className="w-5 h-5 text-gray-600" />
          Share with Client
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