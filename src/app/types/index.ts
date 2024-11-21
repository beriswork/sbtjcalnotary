// Move DistanceMatrixResponse definition directly into this file
export interface DistanceMatrixResponse {
  status: string;
  rows: {
    elements: {
      status: string;
      duration: {
        text: string;
        value: number;
      };
      distance: {
        text: string;
        value: number;
      };
    }[];
  }[];
}

declare global {
  interface Window {
    jspdf: any;
    feeData: FeeData;
  }
}

export interface FeeData {
  totalFees: number;
  stampFees: number;
  witnessFees: number;
  addlSignerFees: number;
  totalTravelFees: number;
  travelDistanceFees: number;
  travelTimeFees: number;
  apptTimeFees: number;
  printingScanningFees: number;
}

export interface CalculatorInputs {
  // Basic notary inputs
  numStamps: number;
  numWitnesses: number;
  numAddlSigners: number;
  numPrintScans: number;
  
  // Fee amounts
  fixedStampFee: number;
  additionalStampFee: number;
  irsMileage: number;
  hourlyRate: number;
  witnessFee: number;
  addlSignerFee: number;
  printScanFees: number;
  
  // Travel related
  travelFee: number;
  travelTime: number;
  apptTime: number;
} 