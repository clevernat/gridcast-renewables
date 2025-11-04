import { useEffect, useRef, useState } from 'react';

interface PlaceResult {
  address: string;
  latitude: number;
  longitude: number;
}

export function useGooglePlacesAutocomplete(
  onPlaceSelected: (place: PlaceResult) => void
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Address autocomplete will not work.');
      return;
    }

    // Check if script is already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize autocomplete when script is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
          fields: ['formatted_address', 'geometry', 'name'],
        }
      );

      // Add listener for place selection
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();

        if (place?.geometry?.location) {
          const result: PlaceResult = {
            address: place.formatted_address || place.name || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };

          onPlaceSelected(result);
        }
      });

      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [isLoaded, onPlaceSelected]);

  return { inputRef, isLoaded };
}

