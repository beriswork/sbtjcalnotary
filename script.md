let autocomplete1, autocomplete2;

function initAutocomplete() {
    const startLocationInput = document.getElementById('startLocation');
    const destinationInput = document.getElementById('destination');

    const startAutocomplete = new google.maps.places.Autocomplete(startLocationInput);
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);

    startAutocomplete.addListener('place_changed', function() {
        const place = startAutocomplete.getPlace();
        console.log('Start location:', place);
    });

    destinationAutocomplete.addListener('place_changed', function() {
        const place = destinationAutocomplete.getPlace();
        console.log('Destination:', place);
    });
}

// Calculate distance between two points
function calculateDistance() {
    console.log('Starting distance calculation...');

    const origin = document.getElementById('startLocation').value;
    const destination = document.getElementById('destination').value;

    console.log('Input values:', { origin, destination });

    if (!origin || !destination) {
        console.warn('Missing required inputs');
        alert('Please enter both start location and destination.');
        return;
    }

    try {
        const service = new google.maps.DistanceMatrixService();
        console.log('Making Distance Matrix API request...');
        
        const request = {
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false
        };

        service.getDistanceMatrix(request, handleDistanceResponse);
    } catch (error) {
        console.error('Error in distance calculation:', error);
        alert('Error calculating distance. Please try again.');
    }
}

// Handle the Distance Matrix API response
function handleDistanceResponse(response, status) {
    console.log('Distance Matrix API response received:', { status });
    console.log('Full API response:', response);

    if (status !== 'OK') {
        console.error('Distance Matrix API error:', status);
        alert('Error: Unable to calculate distance. Status: ' + status);
        return;
    }

    try {
        const result = response.rows[0].elements[0];
        
        if (result.status !== 'OK') {
            console.error('Route calculation failed:', result.status);
            alert('Unable to find a route between these locations.');
            return;
        }

        // Extract and convert values
        const distanceText = result.distance.text;
        const distanceValue = result.distance.value; // in meters
        const durationText = result.duration.text;
        const durationValue = result.duration.value; // in seconds

        // Convert to required units
        const distanceInMiles = (distanceValue / 1609.344).toFixed(2);
        const durationInMinutes = Math.round(durationValue / 60);

        console.log('Calculated values:', {
            distanceText,
            distanceInMiles,
            durationText,
            durationInMinutes
        });

        // Update form fields
        document.getElementById('travelFee').value = distanceInMiles;
        document.getElementById('travelTime').value = durationInMinutes;

        // Show success message
        alert(`Distance: ${distanceText}\nEstimated travel time: ${durationText}`);

    } catch (error) {
        console.error('Error processing distance results:', error);
        alert('Error processing distance calculation results.');
    }
}

// Add error handler for Google Maps
window.gm_authFailure = function() {
    console.error('Google Maps authentication failed');
    alert('Error: Google Maps authentication failed. Please check your API key.');
};

// Initialize when Google Maps loads
google.maps.event.addDomListener(window, 'load', () => {
    console.log('Google Maps loaded, initializing autocomplete...');
    initAutocomplete();
});

function calculateFees() {
    const maxPerStamp = parseFloat(document.getElementById('maxPerStamp').value) || 0;
    const irsMileage = parseFloat(document.getElementById('irsMileage').value) || 0;
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    const witnessFee = parseFloat(document.getElementById('witnessFee').value) || 0;
    const addlSignerFee = parseFloat(document.getElementById('addlSignerFee').value) || 0;
    const printScanFees = parseFloat(document.getElementById('printScanFees').value) || 0;

    const numStamps = parseInt(document.getElementById('numStamps').value) || 0;
    const numWitnesses = parseInt(document.getElementById('numWitnesses').value) || 0;
    const numAddlSigners = parseInt(document.getElementById('numAddlSigners').value) || 0;
    const travelFee = parseFloat(document.getElementById('travelFee').value) || 0;
    const travelTime = parseFloat(document.getElementById('travelTime').value) || 0;
    const apptTime = parseFloat(document.getElementById('apptTime').value) || 0;
    const printingScanningFees = parseFloat(document.getElementById('printingScanningFees').value) || 0;

    // Calculate fees
    const stampFees = numStamps * maxPerStamp;
    const witnessFees = numWitnesses * witnessFee;
    const addlSignerFees = numAddlSigners * addlSignerFee;
    
    // Break down travel fees
    const travelDistanceFees = (travelFee * 2) * irsMileage;
    const travelTimeFees = (travelTime / 60 * hourlyRate) * 2;
    const totalTravelFees = travelDistanceFees + travelTimeFees;
    
    const apptTimeFees = (apptTime / 60) * hourlyRate;

    const totalFees = stampFees + witnessFees + addlSignerFees + totalTravelFees + apptTimeFees + printingScanningFees;

    // Set window.feeData for PDF generation
    window.feeData = {
        totalFees,
        stampFees,
        witnessFees,
        addlSignerFees,
        totalTravelFees,
        travelDistanceFees,
        travelTimeFees,
        apptTimeFees,
        printingScanningFees
    };

    const resultHTML = `
        <h2>Total Fees: $${totalFees.toFixed(2)}</h2>
        <div class="fee-breakdown">
            <p><span class="fee-label">Stamp Fees:</span> $${stampFees.toFixed(2)} | <span class="fee-label">Witness Fees:</span> $${witnessFees.toFixed(2)} | <span class="fee-label">Additional Signer Fees:</span> $${addlSignerFees.toFixed(2)} | <span class="fee-label">Travel Fees:</span> $${totalTravelFees.toFixed(2)} (Distance: $${travelDistanceFees.toFixed(2)}, Time: $${travelTimeFees.toFixed(2)}) | <span class="fee-label">Appointment Time Fees:</span> $${apptTimeFees.toFixed(2)} | <span class="fee-label">Printing/Scanning Fees:</span> $${printingScanningFees.toFixed(2)}</p>
        </div>
    `;

    const resultContainer = document.getElementById('resultContent');
    resultContainer.innerHTML = resultHTML;
    document.getElementById('result').classList.remove('show');
    const downloadButton = document.getElementById('downloadPDF');
    downloadButton.style.display = 'flex';
    
    // Add click event listener directly to the button
    downloadButton.onclick = function() {
        console.log('Download button clicked (inline)');
        generatePDF();
    };

    // Add animation effect
    setTimeout(() => {
        document.getElementById('result').classList.add('show');
    }, 100);

    console.log('Fees calculated, download button should be visible');
}

function generatePDF() {
    console.log('Generate PDF function called');
    console.log('Window fee data:', window.feeData);
    
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library is not loaded');
        alert('Unable to generate PDF. Please check your internet connection and try again.');
        return;
    }

    if (!window.feeData) {
        console.error('Fee data is not available');
        alert('Please calculate fees before generating PDF.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set colors
    const primaryColor = [0, 82, 204];  // #0052CC in RGB
    const secondaryColor = [77, 77, 77];  // #4D4D4D in RGB

    // Add header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Notary Fee Calculation', 105, 25, null, null, 'center');

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Add total fees
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Fees: $${window.feeData.totalFees.toFixed(2)}`, 20, 50);

    // Create table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const tableData = [
        ['Fee Type', 'Amount'],
        ['Stamp Fees', `$${window.feeData.stampFees.toFixed(2)}`],
        ['Witness Fees', `$${window.feeData.witnessFees.toFixed(2)}`],
        ['Additional Signer Fees', `$${window.feeData.addlSignerFees.toFixed(2)}`],
        ['Travel Fees', `$${window.feeData.totalTravelFees.toFixed(2)}`],
        ['- Distance', `$${window.feeData.travelDistanceFees.toFixed(2)}`],
        ['- Time', `$${window.feeData.travelTimeFees.toFixed(2)}`],
        ['Appointment Time Fees', `$${window.feeData.apptTimeFees.toFixed(2)}`],
        ['Printing/Scanning Fees', `$${window.feeData.printingScanningFees.toFixed(2)}`]
    ];

    doc.autoTable({
        startY: 60,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 60, halign: 'right' }
        },
        styles: { 
            fontSize: 10,
            cellPadding: 5
        },
        didParseCell: function(data) {
            if (data.row.index > 3 && data.row.index < 7) {
                if (data.column.index === 0) {
                    data.cell.styles.fontStyle = 'italic';
                }
            }
        }
    });

    // Add copyright notice
    const currentYear = new Date().getFullYear();
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`© Generated by Solutions by TJ ${currentYear}`, 200, 285, null, null, 'right');

    // Save the PDF
    try {
        console.log('Attempting to save PDF');
        doc.save('notary_fee_calculation.pdf');
        console.log('PDF saved successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please try again.');
    }
}

// Update the initialization to properly load required libraries
function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC39CwmXsxJuuQ0jvhXrG_DHrTNAac3KgM&libraries=places,geometry,distance-matrix&callback=initializeGoogleServices`;
    script.async = true;
    script.defer = true;
    script.onerror = function() {
        console.error('Failed to load Google Maps script');
        alert('Error loading Google Maps. Please check your internet connection and try again.');
    };
    document.head.appendChild(script);
}

// New initialization function to handle the callback
function initializeGoogleServices() {
    console.log('Google Maps services initialized');
    try {
        initAutocomplete();
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Error initializing Google services. Please refresh the page.');
    }
}

// Replace the existing window.onload
window.onload = function() {
    console.log('Window loaded');
    loadGoogleMapsScript();
    
    // Set up PDF download button listener
    const downloadButton = document.getElementById('downloadPDF');
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            console.log('Download button clicked (event listener)');
            generatePDF();
        });
    } else {
        console.error('Download button not found');
    }
};

// Add global error handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error('JavaScript error:', message, 'at', source, 'line', lineno);
    return false;
};