# Address Autocomplete Feature

GridCast Renewables includes a **completely free** address autocomplete feature powered by OpenStreetMap's Nominatim service.

## ✅ Key Benefits

- **100% Free** - No API key required
- **No Credit Card** - No payment information needed
- **No Limits** - Reasonable usage is completely free
- **Privacy-Friendly** - Open-source and community-driven
- **US Addresses** - Optimized for United States locations

## 🚀 How It Works

### User Experience

1. **Start typing** an address in the address field
2. **Wait 300ms** - Autocomplete suggestions appear automatically
3. **See up to 5 suggestions** from OpenStreetMap
4. **Click a suggestion** - Address and coordinates auto-fill
5. **Submit the form** - Ready to analyze!

### Technical Details

**Service:** Nominatim (OpenStreetMap Geocoding API)
- **Endpoint:** `https://nominatim.openstreetmap.org/search`
- **Rate Limit:** 1 request per second (enforced by debouncing)
- **Coverage:** Worldwide (restricted to US in our implementation)
- **Data Source:** OpenStreetMap community data

## 🎨 Features

### Smart Debouncing
- Waits 300ms after you stop typing before searching
- Reduces unnecessary API calls
- Provides smooth user experience

### Visual Feedback
- ✓ Green checkmark shows autocomplete is enabled
- 🔄 Loading spinner while fetching suggestions
- 📍 Location pin icon for each suggestion
- Hover effects for better UX

### Fallback Options
- Manual geocoding button still available
- Can enter coordinates directly
- Toggle between address and GPS mode

## 📋 Usage Policy

OpenStreetMap's Nominatim service is free but has usage guidelines:

### ✅ Acceptable Use
- Personal projects
- Small to medium websites
- Educational purposes
- Non-profit organizations
- Reasonable request rates

### ⚠️ Usage Guidelines
1. **Rate Limiting:** Max 1 request per second (we handle this automatically)
2. **User-Agent:** Must identify your application (we set this)
3. **Caching:** Cache results when possible (we don't cache currently)
4. **Attribution:** Credit OpenStreetMap (included in footer)

### ❌ Not Allowed
- High-volume commercial use without permission
- Automated bulk geocoding
- Scraping or downloading the entire database

## 🔄 Comparison: Free vs Paid Options

### OpenStreetMap Nominatim (Current - FREE)
- ✅ **Cost:** Free
- ✅ **Setup:** No API key needed
- ✅ **Privacy:** Open-source, community-driven
- ⚠️ **Rate Limit:** 1 request/second
- ⚠️ **Accuracy:** Good (community-maintained)
- ⚠️ **Support:** Community forums only

### Google Places API (Alternative - PAID)
- ⚠️ **Cost:** $200/month free credit, then paid
- ❌ **Setup:** Requires API key + credit card
- ⚠️ **Privacy:** Google tracks usage
- ✅ **Rate Limit:** Higher limits
- ✅ **Accuracy:** Excellent (Google-maintained)
- ✅ **Support:** Official Google support

## 🛠️ For Developers

### Implementation

The autocomplete is implemented using a custom React hook:

```typescript
// hooks/useOpenStreetMapAutocomplete.ts
export function useOpenStreetMapAutocomplete(
  onPlaceSelected: (place: PlaceResult) => void
)
```

### Key Features
- Debounced search (300ms delay)
- Automatic US country restriction
- Clean TypeScript types
- Error handling
- Loading states

### Customization

You can modify the behavior in `hooks/useOpenStreetMapAutocomplete.ts`:

**Change debounce delay:**
```typescript
setTimeout(() => {
  fetchSuggestions(query);
}, 300); // Change this value (in milliseconds)
```

**Change number of suggestions:**
```typescript
`&limit=5` // Change to any number 1-10
```

**Remove US restriction:**
```typescript
`&countrycodes=us` // Remove this parameter for worldwide
```

**Add more countries:**
```typescript
`&countrycodes=us,ca,mx` // US, Canada, Mexico
```

## 🔮 Future Enhancements

Potential improvements for the future:

1. **Caching** - Store recent searches to reduce API calls
2. **Geolocation** - Prioritize nearby addresses
3. **Address Validation** - Verify address format
4. **Multiple Providers** - Fallback to other services if needed
5. **Offline Mode** - Cache common addresses locally

## 📚 Resources

- [Nominatim Documentation](https://nominatim.org/release-docs/latest/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [Alternative Geocoding Services](https://wiki.openstreetmap.org/wiki/Search_engines)

## 🆘 Troubleshooting

### Autocomplete not showing suggestions?

1. **Type at least 3 characters** - Minimum required for search
2. **Wait 300ms** - Debounce delay before search starts
3. **Check browser console** - Look for error messages
4. **Try a different address** - Some addresses may not be in OSM database

### Suggestions are inaccurate?

- OpenStreetMap data is community-maintained
- Some addresses may be outdated or missing
- Use the manual geocoding button as fallback
- Consider contributing to OpenStreetMap to improve data

### Rate limit errors?

- We automatically debounce to 1 request/second
- If you see errors, wait a few seconds and try again
- Don't rapidly type and delete - let debouncing work

## 🙏 Attribution

This feature uses data from:
- **OpenStreetMap** contributors
- **Nominatim** geocoding service

Thank you to the open-source community! 🌍

