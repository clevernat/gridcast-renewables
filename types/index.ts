// Asset Types
export type AssetType = "solar" | "wind";

// Location Interface
export interface Location {
  address?: string;
  latitude: number;
  longitude: number;
}

// Solar Asset Configuration
export interface SolarAsset {
  type: "solar";
  dcCapacity: number; // in kW
  systemLosses?: number; // percentage (default 14%)
  tilt?: number; // panel tilt angle in degrees
  azimuth?: number; // panel azimuth in degrees (180 = south)
}

// Wind Asset Configuration
export interface WindAsset {
  type: "wind";
  ratedCapacity: number; // in MW
  hubHeight: number; // in meters
  cutInSpeed?: number; // m/s (default 3)
  ratedSpeed?: number; // m/s (default 12)
  cutOutSpeed?: number; // m/s (default 25)
}

export type Asset = SolarAsset | WindAsset;

// Weather Data Interfaces - Enhanced for Atmospheric Science Research
export interface HourlyWeatherData {
  time: string;

  // Temperature & Thermodynamics
  temperature?: number; // °C at 2m
  temperatureMax?: number; // °C daily max
  temperatureMin?: number; // °C daily min
  apparentTemperature?: number; // °C feels like
  dewPoint?: number; // °C dew point temperature

  // Solar Radiation
  solarIrradiance?: number; // W/m² total shortwave
  directRadiation?: number; // W/m² direct beam
  diffuseRadiation?: number; // W/m² diffuse
  directNormalIrradiance?: number; // W/m² DNI
  terrestrialRadiation?: number; // W/m² longwave

  // Atmospheric Pressure
  surfacePressure?: number; // hPa surface pressure
  seaLevelPressure?: number; // hPa MSL pressure

  // Humidity & Moisture
  relativeHumidity?: number; // % relative humidity
  specificHumidity?: number; // g/kg specific humidity
  vaporPressureDeficit?: number; // kPa VPD

  // Precipitation
  precipitation?: number; // mm total precipitation
  rain?: number; // mm rainfall
  snowfall?: number; // cm snowfall
  precipitationProbability?: number; // % probability

  // Cloud Cover & Visibility
  cloudCover?: number; // % total cloud cover
  cloudCoverLow?: number; // % low cloud cover
  cloudCoverMid?: number; // % mid cloud cover
  cloudCoverHigh?: number; // % high cloud cover
  visibility?: number; // meters visibility

  // Wind (Multi-level)
  windSpeed?: number; // m/s at specified height
  windSpeed10m?: number; // m/s at 10m
  windSpeed80m?: number; // m/s at 80m
  windSpeed100m?: number; // m/s at 100m
  windSpeed120m?: number; // m/s at 120m
  windDirection?: number; // degrees
  windGusts?: number; // m/s wind gusts

  // Atmospheric Stability & Boundary Layer
  cape?: number; // J/kg Convective Available Potential Energy
  surfaceLiftedIndex?: number; // K lifted index
  boundaryLayerHeight?: number; // m mixing height

  // Air Quality & Atmospheric Composition
  uvIndex?: number; // UV index
  aerosolOpticalDepth?: number; // AOD at 550nm

  // Soil & Surface (for land-atmosphere interaction)
  soilTemperature?: number; // °C soil temperature
  soilMoisture?: number; // m³/m³ volumetric
  snowDepth?: number; // meters snow depth

  // Data Quality Flags
  dataQuality?: "excellent" | "good" | "fair" | "poor";
  missingDataFlags?: string[];
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
  type: "solar" | "wind";
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

// Atmospheric Research Types
export interface AtmosphericStatistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
  count: number;
  missingCount: number;
}

export interface CorrelationMatrix {
  variables: string[];
  matrix: number[][]; // correlation coefficients
  pValues?: number[][]; // statistical significance
}

export interface TrendAnalysis {
  variable: string;
  slope: number; // trend slope
  intercept: number;
  rSquared: number; // coefficient of determination
  pValue: number; // statistical significance
  trend: "increasing" | "decreasing" | "stable";
  confidence: number; // 0-1
}

export interface AnomalyDetection {
  timestamp: string;
  variable: string;
  value: number;
  expectedValue: number;
  deviation: number; // standard deviations from mean
  severity: "low" | "medium" | "high" | "extreme";
}

export interface DataQualityReport {
  totalRecords: number;
  completeRecords: number;
  missingDataPercentage: number;
  qualityScore: number; // 0-100
  variableCompleteness: Record<string, number>; // percentage complete per variable
  outlierCount: number;
  suspiciousValues: Array<{
    timestamp: string;
    variable: string;
    value: number;
    reason: string;
  }>;
}

export interface AtmosphericResearchData {
  location: Location;
  timeRange: {
    start: string;
    end: string;
  };
  weatherData: HourlyWeatherData[];
  statistics: Record<string, AtmosphericStatistics>;
  correlations?: CorrelationMatrix;
  trends?: TrendAnalysis[];
  anomalies?: AnomalyDetection[];
  dataQuality: DataQualityReport;
}

// Batch Analysis Types
export interface BatchLocation {
  id: string;
  name: string;
  location: Location;
  asset: Asset;
}

export interface BatchAnalysisResult {
  location: BatchLocation;
  forecast?: PowerForecast;
  longTerm?: LongTermAnalysis;
  atmosphericData?: AtmosphericResearchData;
  rank?: number;
  score?: number;
  error?: string;
}

export interface BatchAnalysisProgress {
  total: number;
  completed: number;
  failed: number;
  currentLocation?: string;
  percentage: number;
}
