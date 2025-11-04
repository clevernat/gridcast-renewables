import { Location, Asset, PowerForecast, LongTermAnalysis } from "@/types";

export interface SavedLocation {
  id: string;
  location: Location;
  asset: Asset;
  timestamp: number;
  isFavorite: boolean;
  nickname?: string;
}

export interface ComparisonData {
  location: SavedLocation;
  forecast?: PowerForecast;
  longTerm?: LongTermAnalysis;
}

const STORAGE_KEYS = {
  LOCATION_HISTORY: "gridcast_location_history",
  FAVORITES: "gridcast_favorites",
  COMPARISON_SLOTS: "gridcast_comparison_slots",
  PREFERENCES: "gridcast_preferences",
};

/**
 * Save a location to history
 */
export function saveLocationToHistory(
  location: Location,
  asset: Asset,
  nickname?: string
): SavedLocation {
  const savedLocation: SavedLocation = {
    id: generateLocationId(location, asset),
    location,
    asset,
    timestamp: Date.now(),
    isFavorite: false,
    nickname,
  };

  const history = getLocationHistory();

  // Remove duplicate if exists
  const filtered = history.filter((loc) => loc.id !== savedLocation.id);

  // Add to beginning and limit to 20 items
  const updated = [savedLocation, ...filtered].slice(0, 20);

  localStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(updated));

  return savedLocation;
}

/**
 * Get location history
 */
export function getLocationHistory(): SavedLocation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to load location history:", err);
    return [];
  }
}

/**
 * Clear location history
 */
export function clearLocationHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.LOCATION_HISTORY);
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(locationId: string): boolean {
  const history = getLocationHistory();
  const location = history.find((loc) => loc.id === locationId);

  if (!location) return false;

  location.isFavorite = !location.isFavorite;
  localStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));

  return location.isFavorite;
}

/**
 * Get favorite locations
 */
export function getFavoriteLocations(): SavedLocation[] {
  return getLocationHistory().filter((loc) => loc.isFavorite);
}

/**
 * Update location nickname
 */
export function updateLocationNickname(
  locationId: string,
  nickname: string
): void {
  const history = getLocationHistory();
  const location = history.find((loc) => loc.id === locationId);

  if (location) {
    location.nickname = nickname;
    localStorage.setItem(
      STORAGE_KEYS.LOCATION_HISTORY,
      JSON.stringify(history)
    );
  }
}

/**
 * Delete a location from history
 */
export function deleteLocation(locationId: string): void {
  const history = getLocationHistory();
  const filtered = history.filter((loc) => loc.id !== locationId);
  localStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(filtered));
}

/**
 * Generate unique location ID
 */
function generateLocationId(location: Location, asset: Asset): string {
  const locStr = `${location.latitude.toFixed(4)}_${location.longitude.toFixed(
    4
  )}`;
  const assetStr =
    asset.type === "solar"
      ? `solar_${asset.dcCapacity}_${asset.systemLosses}`
      : `wind_${asset.ratedCapacity}_${asset.hubHeight}`;
  return `${locStr}_${assetStr}`;
}

/**
 * Save comparison data
 */
export function saveComparisonSlot(
  slotIndex: number,
  data: ComparisonData
): void {
  const slots = getComparisonSlots();
  slots[slotIndex] = data;
  localStorage.setItem(STORAGE_KEYS.COMPARISON_SLOTS, JSON.stringify(slots));
}

/**
 * Get comparison slots
 */
export function getComparisonSlots(): ComparisonData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPARISON_SLOTS);
    return data ? JSON.parse(data) : [null, null, null];
  } catch (err) {
    console.error("Failed to load comparison slots:", err);
    return [null, null, null];
  }
}

/**
 * Clear comparison slot
 */
export function clearComparisonSlot(slotIndex: number): void {
  const slots = getComparisonSlots();
  slots[slotIndex] = null;
  localStorage.setItem(STORAGE_KEYS.COMPARISON_SLOTS, JSON.stringify(slots));
}

/**
 * Clear all comparison slots
 */
export function clearAllComparisonSlots(): void {
  localStorage.setItem(
    STORAGE_KEYS.COMPARISON_SLOTS,
    JSON.stringify([null, null, null])
  );
}

/**
 * User preferences
 */
export interface UserPreferences {
  defaultAssetType: "solar" | "wind";
  defaultYears: number;
  showTooltips: boolean;
  autoSaveHistory: boolean;
  emailNotifications: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultAssetType: "solar",
  defaultYears: 5,
  showTooltips: true,
  autoSaveHistory: true,
  emailNotifications: false,
};

/**
 * Get user preferences
 */
export function getUserPreferences(): UserPreferences {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) }
      : DEFAULT_PREFERENCES;
  } catch (err) {
    console.error("Failed to load preferences:", err);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update user preferences
 */
export function updateUserPreferences(
  preferences: Partial<UserPreferences>
): void {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
}

/**
 * Reset preferences to default
 */
export function resetPreferences(): void {
  localStorage.setItem(
    STORAGE_KEYS.PREFERENCES,
    JSON.stringify(DEFAULT_PREFERENCES)
  );
}

/**
 * Export all data (for backup)
 */
export function exportAllData(): string {
  return JSON.stringify(
    {
      history: getLocationHistory(),
      favorites: getFavoriteLocations(),
      comparison: getComparisonSlots(),
      preferences: getUserPreferences(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Import data (from backup)
 */
export function importAllData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.history) {
      localStorage.setItem(
        STORAGE_KEYS.LOCATION_HISTORY,
        JSON.stringify(data.history)
      );
    }

    if (data.comparison) {
      localStorage.setItem(
        STORAGE_KEYS.COMPARISON_SLOTS,
        JSON.stringify(data.comparison)
      );
    }

    if (data.preferences) {
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(data.preferences)
      );
    }

    return true;
  } catch (err) {
    console.error("Failed to import data:", err);
    return false;
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number;
  available: number;
  percentage: number;
} {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers allow ~5-10MB, we'll assume 5MB
    const available = 5 * 1024 * 1024;
    const percentage = (used / available) * 100;

    return { used, available, percentage };
  } catch (err) {
    return { used: 0, available: 0, percentage: 0 };
  }
}
