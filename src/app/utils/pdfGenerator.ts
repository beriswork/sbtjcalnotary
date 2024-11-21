import { FeeData } from '../types';

declare global {
  interface Window {
    jspdf: any;
  }
}

export const generatePDF = async (feeData: FeeData) => {
  if (typeof window === 'undefined') {
    console.error('PDF generation is not available server-side');
    return;
  }

  try {
    // Wait for jsPDF to be fully loaded
    if (!window.jspdf) {
      console.log('Waiting for jsPDF to load...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!window.jspdf) {
        throw new Error('PDF generation library not loaded');
      }
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colors
    const primaryColor = [0, 82, 204];
    const secondaryColor = [77, 77, 77];
    const accentColor = [245, 247, 250];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Notary Fee Calculation', 105, 25, { align: 'center' });

    // Total Fees
    doc.setTextColor(...primaryColor);
    doc.setFontSize(20);
    doc.text(`Total Fees: $${feeData.totalFees.toFixed(2)}`, 20, 60);

    // Fee Breakdown Table
    const tableData = [
      ['Fee Type', 'Amount'],
      ['Stamp Fees', `$${feeData.stampFees.toFixed(2)}`],
      ['Witness Fees', `$${feeData.witnessFees.toFixed(2)}`],
      ['Additional Signer Fees', `$${feeData.addlSignerFees.toFixed(2)}`],
      ['Travel Fees (Total)', `$${feeData.totalTravelFees.toFixed(2)}`],
      ['- Distance Fees', `$${feeData.travelDistanceFees.toFixed(2)}`],
      ['- Time Fees', `$${feeData.travelTimeFees.toFixed(2)}`],
      ['Appointment Time Fees', `$${feeData.apptTimeFees.toFixed(2)}`],
      ['Printing/Scanning Fees', `$${feeData.printingScanningFees.toFixed(2)}`]
    ];

    // @ts-ignore
    doc.autoTable({
      startY: 70,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: accentColor
      },
      styles: {
        fontSize: 10,
        cellPadding: 8,
        lineColor: [200, 200, 200]
      }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('© 2025 Solutions by TJ', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
      align: 'center'
    });

    // Cross-browser compatible download
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notary_fee_calculation.pdf';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}; 