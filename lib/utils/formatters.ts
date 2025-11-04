/**
 * Utility functions for formatting data for display
 */

/**
 * Format power output for display
 * @param power - Power in kW or MW
 * @param unit - Unit ('kW' or 'MW')
 * @returns Formatted string
 */
export function formatPower(power: number, unit: 'kW' | 'MW' = 'kW'): string {
  return `${power.toFixed(2)} ${unit}`;
}

/**
 * Format energy for display
 * @param energy - Energy in kWh or MWh
 * @param unit - Unit ('kWh' or 'MWh')
 * @returns Formatted string
 */
export function formatEnergy(energy: number, unit: 'kWh' | 'MWh' = 'kWh'): string {
  return `${energy.toFixed(2)} ${unit}`;
}

/**
 * Format percentage for display
 * @param percentage - Percentage value
 * @returns Formatted string
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Format date and time for display
 * @param dateString - ISO date string
 * @returns Formatted string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get month name from month number
 * @param month - Month number (1-12)
 * @returns Month name
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

/**
 * Format coordinates for display
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Formatted string
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`;
}

/**
 * Format large numbers with commas
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Convert kW to MW
 * @param kw - Power in kW
 * @returns Power in MW
 */
export function kwToMw(kw: number): number {
  return kw / 1000;
}

/**
 * Convert MW to kW
 * @param mw - Power in MW
 * @returns Power in kW
 */
export function mwToKw(mw: number): number {
  return mw * 1000;
}

