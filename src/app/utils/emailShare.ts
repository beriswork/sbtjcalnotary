export const shareViaEmail = (pdfBlob: Blob) => {
  const file = new File([pdfBlob], 'notary_bill.pdf', { type: 'application/pdf' });
  
  // Create mailto URL
  const mailtoLink = 'mailto:?subject=Notary Bill&body=Please find attached the notary bill.';
  
  // Open email client
  window.location.href = mailtoLink;
  
  // Note: Due to browser security restrictions, we cannot automatically attach files
  // to mailto links. The best we can do is open the email client.
  // An alternative would be to implement a backend service for email sending.
}; 