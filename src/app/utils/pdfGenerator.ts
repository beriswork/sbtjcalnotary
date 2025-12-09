import { FeeData } from '../types';

declare global {
  interface Window {
    jspdf: any;
    jsPDF: any;
  }
}

// Store the last generated PDF blob
let lastGeneratedPdfBlob: Blob | null = null;

// Helper function to wait for jsPDF to load
const waitForJsPDF = async (maxRetries = 20): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    // Check multiple possible locations where jsPDF might be exposed
    if (window.jsPDF) {
      return window.jsPDF;
    }
    if (window.jspdf?.jsPDF) {
      return window.jspdf.jsPDF;
    }
    if ((window as any).jspdf) {
      return (window as any).jspdf.jsPDF || (window as any).jspdf;
    }
    
    console.log(`Waiting for jsPDF to load... attempt ${i + 1}/${maxRetries}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('PDF generation library failed to load. Please refresh the page and try again.');
};

export const generatePDF = async (feeData: FeeData) => {
  if (typeof window === 'undefined') {
    console.error('PDF generation is not available server-side');
    return;
  }

  try {
    // Wait for jsPDF to be fully loaded with retry mechanism
    const jsPDFConstructor = await waitForJsPDF();
    
    if (!jsPDFConstructor) {
      throw new Error('jsPDF constructor not found');
    }

    const doc = new jsPDFConstructor();

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
    
    // Store the blob for email sharing
    lastGeneratedPdfBlob = blob;
    
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

    console.log('PDF generated successfully!');
    return blob;

  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.';
    alert(errorMessage);
    throw error;
  }
};

export const getLastGeneratedPdf = (): Blob | null => {
  return lastGeneratedPdfBlob;
}; 