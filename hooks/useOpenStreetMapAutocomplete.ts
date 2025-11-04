import { useState, useEffect, useCallback, useRef } from 'react';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface PlaceResult {
  address: string;
  latitude: number;
  longitude: number;
}

export function useOpenStreetMapAutocomplete(
  onPlaceSelected: (place: PlaceResult) => void
) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions from Nominatim (OpenStreetMap)
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Nominatim API - Free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=5` +
        `&countrycodes=us`, // Restrict to US addresses
        {
          headers: {
            'User-Agent': 'GridCast-Renewables', // Required by Nominatim
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // Wait 300ms after user stops typing

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const result: PlaceResult = {
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    };

    onPlaceSelected(result);
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events to fire
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return {
    query,
    suggestions,
    isLoading,
    showSuggestions,
    handleInputChange,
    handleSelectSuggestion,
    handleBlur,
    handleFocus,
  };
}

