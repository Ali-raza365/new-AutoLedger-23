interface NHTSAVehicleData {
  Variable: string;
  Value: string;
  ValueId: string;
  VariableId: number;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAVehicleData[];
}

interface ProcessedVehicleData {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  bodyClass?: string;
  engineModel?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  manufacturerName?: string;
  plantCountry?: string;
  vehicleType?: string;
  series?: string;
  color?: string;
  price?: any;
  seriesDetail?: string;
}

/**
 * NHTSA vPIC API Service
 * Provides VIN decoding and vehicle data extraction using the free NHTSA API
 */
export class NHTSAService {
  private static readonly BASE_URL = 'https://vpic.nhtsa.dot.gov/api';
  private static readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  /**
   * Decode VIN and extract vehicle information
   * @param vin - 17 character VIN number
   * @param modelYear - Optional model year for better accuracy
   * @returns Processed vehicle data
   */
  static async decodeVIN(vin: string, modelYear?: number): Promise<ProcessedVehicleData> {
    try {
      // Validate VIN format
      if (!vin || vin.length !== 17) {
        throw new Error('VIN must be exactly 17 characters');
      }

      // Clean and uppercase VIN
      const cleanVin = vin.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase();
      if (cleanVin.length !== 17) {
        throw new Error('Invalid VIN format - contains invalid characters');
      }

      // Build API URL
      const yearParam = modelYear ? `&modelyear=${modelYear}` : '';
      const url = `${this.BASE_URL}/vehicles/DecodeVinValues/${cleanVin}?format=json${yearParam}`;

      console.log(`[NHTSA Service] Decoding VIN: ${cleanVin}`);

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'DealerPro-VIN-Decoder/1.0',
          'Accept': 'application/json',
        },
      });

      console.log({ response })

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NHTSA API request failed: ${response.status} ${response.statusText}`);
      }

      const data: NHTSAResponse = await response.json();
      console.log({ data })


      if (!data.Results || data.Results.length === 0) {
        throw new Error('No vehicle data found for the provided VIN');
      }

      // Process and extract relevant vehicle data
      return this.processVehicleData(data.Results);

    } catch (error) {
      console.error('[NHTSA Service] VIN decode error:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to NHTSA API service');
      }

      throw error;
    }
  }

  /**
   * Process raw NHTSA API response into structured vehicle data
   * @param results - Array of NHTSA variable-value pairs
   * @returns Processed vehicle data object
   */
  private static processVehicleData(results: NHTSAVehicleData[]): ProcessedVehicleData {
    const vehicleData: ProcessedVehicleData = {};

    console.log({ results })
    // Assuming results[0] is the decoded object
    const decoded = results[0];

    // Create a map for easier extraction
    const dataMap = new Map<string, string>();
    Object.entries(decoded).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() && value !== "Not Applicable") {
        dataMap.set(key, value.trim());
      }
    });

    // Extract and map key vehicle information
    vehicleData.make = dataMap.get("Make") || undefined;
    vehicleData.model = dataMap.get("Model") || undefined;
    vehicleData.year = this.parseYear(dataMap.get("ModelYear")); // ⚠️ key is `ModelYear` not "Model Year"
    vehicleData.trim = dataMap.get("Trim") || dataMap.get("Series") || undefined;
    vehicleData.color = dataMap.get("color") || undefined;
    vehicleData.series = dataMap.get("Series") || dataMap.get("Trim") || undefined;
    vehicleData.bodyClass = dataMap.get("BodyClass") || undefined;
    vehicleData.engineModel = dataMap.get("EngineModel") || undefined;
    vehicleData.fuelType = dataMap.get("FuelTypePrimary") || undefined; // ⚠️ check key
    vehicleData.transmission = dataMap.get("TransmissionStyle") || undefined;
    vehicleData.driveType = dataMap.get("DriveType") || undefined;
    vehicleData.manufacturerName = dataMap.get("Manufacturer") || undefined; // ⚠️ key is "Manufacturer"
    vehicleData.plantCountry = dataMap.get("PlantCountry") || undefined;
    vehicleData.vehicleType = dataMap.get("VehicleType") || undefined;
    vehicleData.price = dataMap.get("BasePrice") || 0;
    vehicleData.seriesDetail = dataMap.get("Series2") || undefined;


    console.log(`[NHTSA Service] Processed vehicle data:`, vehicleData);

    return vehicleData;
  }


  /**
   * Parse year string to number
   * @param yearString - Year as string
   * @returns Year as number or undefined
   */
  private static parseYear(yearString?: string): number | undefined {
    if (!yearString) return undefined;
    const year = parseInt(yearString, 10);
    return !isNaN(year) && year >= 1900 && year <= 2030 ? year : undefined;
  }

  /**
   * Get available makes for a given year
   * @param year - Model year
   * @returns Array of available makes
   */
  static async getMakesForYear(year: number): Promise<string[]> {
    try {
      const url = `${this.BASE_URL}/vehicles/GetMakesForYear/${year}?format=json`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch makes for year ${year}`);
      }

      const data = await response.json();
      return data.Results?.map((item: any) => item.Make_Name) || [];
    } catch (error) {
      console.error('[NHTSA Service] Error fetching makes:', error);
      return [];
    }
  }

  /**
   * Get available models for a make and year
   * @param make - Vehicle make
   * @param year - Model year  
   * @returns Array of available models
   */
  static async getModelsForMakeAndYear(make: string, year: number): Promise<string[]> {
    try {
      const url = `${this.BASE_URL}/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch models for ${make} ${year}`);
      }

      const data = await response.json();
      return data.Results?.map((item: any) => item.Model_Name) || [];
    } catch (error) {
      console.error('[NHTSA Service] Error fetching models:', error);
      return [];
    }
  }
}