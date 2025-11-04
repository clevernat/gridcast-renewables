"use client";

import { useState, useEffect } from "react";
import { Location, Asset } from "@/types";
import {
  getLocationHistory,
  toggleFavorite,
  deleteLocation,
  updateLocationNickname,
  SavedLocation,
} from "@/lib/utils/storageUtils";

interface LocationHistoryProps {
  onSelectLocation: (location: Location, asset: Asset) => void;
}

export default function LocationHistory({ onSelectLocation }: LocationHistoryProps) {
  const [history, setHistory] = useState<SavedLocation[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = getLocationHistory();
    setHistory(data);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadHistory();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocation(id);
      loadHistory();
    }
  };

  const handleStartEdit = (location: SavedLocation) => {
    setEditingId(location.id);
    setEditNickname(location.nickname || "");
  };

  const handleSaveNickname = (id: string) => {
    updateLocationNickname(id, editNickname);
    setEditingId(null);
    loadHistory();
  };

  const displayedHistory = showFavoritesOnly
    ? history.filter((loc) => loc.isFavorite)
    : history;

  if (history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📍</span>
          <h3 className="text-xl font-bold text-gray-900">Location History</h3>
        </div>
        <p className="text-gray-500 text-center py-8">
          No saved locations yet. Generate a forecast to save locations automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <h3 className="text-xl font-bold text-gray-900">Location History</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {history.length}
          </span>
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            showFavoritesOnly
              ? "bg-yellow-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ⭐ Favorites {showFavoritesOnly && `(${history.filter((l) => l.isFavorite).length})`}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedHistory.map((location) => (
          <div
            key={location.id}
            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Nickname or Address */}
                {editingId === location.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="Enter nickname..."
                      className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveNickname(location.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {location.nickname || location.location.address || "Unnamed Location"}
                    </h4>
                    <button
                      onClick={() => handleStartEdit(location)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                      title="Edit nickname"
                    >
                      ✏️
                    </button>
                  </div>
                )}

                {/* Coordinates */}
                <p className="text-xs text-gray-500 mb-2">
                  {location.location.latitude.toFixed(4)}°, {location.location.longitude.toFixed(4)}°
                </p>

                {/* Asset Info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      location.asset.type === "solar"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {location.asset.type === "solar" ? "☀️ Solar" : "💨 Wind"}
                  </span>
                  <span className="text-xs text-gray-600">
                    {location.asset.type === "solar"
                      ? `${location.asset.dcCapacity} kW`
                      : `${location.asset.ratedCapacity} MW`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(location.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleFavorite(location.id)}
                  className={`p-2 rounded-lg transition-all ${
                    location.isFavorite
                      ? "text-yellow-500 hover:bg-yellow-50"
                      : "text-gray-400 hover:bg-gray-100 hover:text-yellow-500"
                  }`}
                  title={location.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {location.isFavorite ? "⭐" : "☆"}
                </button>

                <button
                  onClick={() => onSelectLocation(location.location, location.asset)}
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                  title="Load this location"
                >
                  📂
                </button>

                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete location"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayedHistory.length === 0 && showFavoritesOnly && (
        <p className="text-gray-500 text-center py-8 text-sm">
          No favorite locations yet. Click the ⭐ icon to add favorites.
        </p>
      )}
    </div>
  );
}

