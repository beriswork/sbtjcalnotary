<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notary Fee Calculator</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.20/jspdf.plugin.autotable.min.js"></script>
</head>
<body>
    <header>
        <h1>NOTARY FEE CALCULATOR</h1>
    </header>
    
    <main>
        <div class="calculator-grid">
            <section class="calculator-section">
                <h2>Notary Inputs</h2>
                <label>
                    Max Per Stamp ($)
                    <input type="number" id="maxPerStamp" step="0.01" placeholder="Enter amount">
                </label>
                <label>
                    IRS Mileage ($/mile)
                    <input type="number" id="irsMileage" step="0.01" value="0.670" placeholder="0.670">
                </label>
                <label>
                    Hourly Rate ($)
                    <input type="number" id="hourlyRate" step="0.01" placeholder="Enter rate">
                </label>
                <label>
                    Witness Fee ($)
                    <input type="number" id="witnessFee" step="0.01" placeholder="Enter fee">
                </label>
                <label>
                    Add'l Signer Fee ($)
                    <input type="number" id="addlSignerFee" step="0.01" placeholder="Enter fee">
                </label>
                <label>
                    Print/Scan Fees ($)
                    <input type="number" id="printScanFees" step="0.01" placeholder="Enter fees">
                </label>
            </section>

            <section class="calculator-section">
                <h2>Travel Details</h2>
                <label>
                    Start Location
                    <input type="text" id="startLocation" placeholder="Enter start location">
                </label>
                <label>
                    Destination
                    <input type="text" id="destination" placeholder="Enter destination">
                </label>
                <button onclick="calculateDistance()" class="secondary-button">Calculate Distance and Time</button>
                <label>
                    Travel Fee (miles)
                    <input type="number" id="travelFee" readonly placeholder="Calculated miles">
                </label>
                <label>
                    Travel Time (minutes)
                    <input type="number" id="travelTime" readonly placeholder="Calculated time">
                </label>
            </section>

            <section class="calculator-section">
                <h2>Job Details</h2>
                <label>
                    # of Stamps
                    <input type="number" id="numStamps" placeholder="Enter number">
                </label>
                <label>
                    # of Witnesses Needed
                    <input type="number" id="numWitnesses" placeholder="Enter number">
                </label>
                <label>
                    # of Add'l Signers
                    <input type="number" id="numAddlSigners" placeholder="Enter number">
                </label>
                <label>
                    Appt Time/Expertise (minutes)
                    <input type="number" id="apptTime" placeholder="Enter time">
                </label>
                <label>
                    Printing/Scanning Fees ($)
                    <input type="number" id="printingScanningFees" step="0.01" placeholder="Enter fees">
                </label>
            </section>
        </div>

        <div class="banner">
            <span>Click here to calculate the fee immediately 👉</span>
            <button onclick="calculateFees()" class="primary-button">CALCULATE</button>
        </div>

        <div id="result" class="result-container">
            <div id="resultContent"></div>
            <button id="downloadPDF" class="download-button" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
            </button>
        </div>
    </main>

    <script>
        function handleGoogleMapsError() {
            console.error('Google Maps failed to load');
            alert('Error loading Google Maps. Please check your internet connection and try again.');
        }
    </script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC39CwmXsxJuuQ0jvhXrG_DHrTNAac3KgM&libraries=places&callback=initAutocomplete" async defer onerror="handleGoogleMapsError()"></script>
    <script src="script.js"></script>
</body>
</html>