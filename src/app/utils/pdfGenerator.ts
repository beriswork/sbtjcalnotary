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
const waitForJsPDF = async (maxRetries = 30): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    // Check multiple possible locations where jsPDF might be exposed
    if (window.jsPDF) {
      console.log('✅ Found jsPDF at window.jsPDF');
      return window.jsPDF;
    }
    if (window.jspdf?.jsPDF) {
      console.log('✅ Found jsPDF at window.jspdf.jsPDF');
      return window.jspdf.jsPDF;
    }
    if ((window as any).jspdf) {
      const jsPDF = (window as any).jspdf.jsPDF || (window as any).jspdf;
      if (jsPDF) {
        console.log('✅ Found jsPDF at window.jspdf (fallback)');
        return jsPDF;
      }
    }
    
    if (i === 0 || i % 5 === 0) {
      console.log(`⏳ Waiting for jsPDF to load... attempt ${i + 1}/${maxRetries}`);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error('PDF generation library failed to load. Please refresh the page and try again.');
};

// Helper function to wait for autoTable plugin to load
const waitForAutoTable = async (maxRetries = 25): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    // Check if autoTable is available on jsPDF prototype
    const jsPDFClass = window.jsPDF || window.jspdf?.jsPDF;
    if (jsPDFClass && jsPDFClass.API && jsPDFClass.API.autoTable) {
      console.log('✅ autoTable plugin is loaded and ready');
      return true;
    }
    
    if (i === 0 || i % 5 === 0) {
      console.log(`⏳ Waiting for autoTable plugin... attempt ${i + 1}/${maxRetries}`);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  console.warn('⚠️ autoTable plugin not detected after waiting, using fallback text rendering');
  return false;
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

    // Wait for autoTable plugin
    const hasAutoTable = await waitForAutoTable();

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

    // Fee Breakdown
    if (hasAutoTable && typeof doc.autoTable === 'function') {
      // Use autoTable if available
      const tableData = [
        ['Fee Type', 'Amount'],
        ['Stamp Fees', `$${feeData.stampFees.toFixed(2)}`],
        ['Witness Fees', `$${feeData.witnessFees.toFixed(2)}`],
        ['Additional Signer Fees', `$${feeData.addlSignerFees.toFixed(2)}`],
        ['Travel Fees (Total)', `$${feeData.totalTravelFees.toFixed(2)}`],
        ['  - Distance Fees', `$${feeData.travelDistanceFees.toFixed(2)}`],
        ['  - Time Fees', `$${feeData.travelTimeFees.toFixed(2)}`],
        ['Appointment Time Fees', `$${feeData.apptTimeFees.toFixed(2)}`],
        ['Printing/Scanning Fees', `$${feeData.printingScanningFees.toFixed(2)}`]
      ];

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
    } else {
      // Fallback: Manual table rendering
      console.log('Using fallback table rendering');
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Fee Breakdown:', 20, 80);
      
      let yPos = 95;
      const lineHeight = 10;
      
      const fees = [
        ['Stamp Fees', feeData.stampFees],
        ['Witness Fees', feeData.witnessFees],
        ['Additional Signer Fees', feeData.addlSignerFees],
        ['Travel Fees (Total)', feeData.totalTravelFees],
        ['  - Distance Fees', feeData.travelDistanceFees],
        ['  - Time Fees', feeData.travelTimeFees],
        ['Appointment Time Fees', feeData.apptTimeFees],
        ['Printing/Scanning Fees', feeData.printingScanningFees]
      ];
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      fees.forEach(([label, amount]) => {
        doc.text(label as string, 25, yPos);
        doc.text(`$${(amount as number).toFixed(2)}`, 170, yPos, { align: 'right' });
        yPos += lineHeight;
      });
    }

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