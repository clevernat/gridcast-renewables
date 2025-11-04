// Asset Types
export type AssetType = 'solar' | 'wind';

// Location Interface
export interface Location {
  address?: string;
  latitude: number;
  longitude: number;
}

// Solar Asset Configuration
export interface SolarAsset {
  type: 'solar';
  dcCapacity: number; // in kW
  systemLosses?: number; // percentage (default 14%)
  tilt?: number; // panel tilt angle in degrees
  azimuth?: number; // panel azimuth in degrees (180 = south)
}

// Wind Asset Configuration
export interface WindAsset {
  type: 'wind';
  ratedCapacity: number; // in MW
  hubHeight: number; // in meters
  cutInSpeed?: number; // m/s (default 3)
  ratedSpeed?: number; // m/s (default 12)
  cutOutSpeed?: number; // m/s (default 25)
}

export type Asset = SolarAsset | WindAsset;

// Weather Data Interfaces
export interface HourlyWeatherData {
  time: string;
  temperature?: number;
  solarIrradiance?: number; // W/m²
  cloudCover?: number; // percentage
  windSpeed?: number; // m/s at specified height
  windDirection?: number; // degrees
}

export interface WeatherForecast {
  location: Location;
  hourly: HourlyWeatherData[];
}

// Power Output Interfaces
export interface PowerOutput {
  time: string;
  power: number; // in kWh
  capacity?: number; // percentage of rated capacity
}

export interface PowerForecast {
  asset: Asset;
  location: Location;
  outputs: PowerOutput[];
  meteorologicalData: HourlyWeatherData[];
}

// Long-term Analysis
export interface MonthlyAverage {
  month: number; // 1-12
  monthName: string;
  averageProduction: number; // kWh
  averageCapacityFactor: number; // percentage
}

export interface LongTermAnalysis {
  asset: Asset;
  location: Location;
  monthlyAverages: MonthlyAverage[];
  annualProduction: number; // kWh/year
  averageCapacityFactor: number; // percentage
}

// National Map Data
export interface GridPoint {
  latitude: number;
  longitude: number;
  value: number; // energy potential value
}

export interface NationalEnergyMap {
  type: 'solar' | 'wind';
  timestamp: string;
  gridPoints: GridPoint[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// API Response Types
export interface APIError {
  error: string;
  message: string;
  details?: any;
}

export interface ForecastAPIResponse {
  success: boolean;
  data?: PowerForecast;
  error?: APIError;
}

export interface LongTermAPIResponse {
  success: boolean;
  data?: LongTermAnalysis;
  error?: APIError;
}

export interface NationalMapAPIResponse {
  success: boolean;
  data?: NationalEnergyMap;
  error?: APIError;
}

// Form State
export interface AssetConfiguration {
  location: Location;
  asset: Asset;
}

