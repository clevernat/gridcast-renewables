# Google Maps API Setup Guide

This guide will help you set up the Google Maps API for the address autocomplete feature in GridCast Renewables.

## Prerequisites

- A Google Cloud Platform account
- A credit card (required for Google Cloud, but the free tier should cover typical usage)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "GridCast Renewables")
5. Click "Create"

### 2. Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for and enable the following APIs:
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for converting addresses to coordinates)

### 3. Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Your API key will be created and displayed
4. **Important:** Click "Restrict Key" to secure it

### 4. Restrict Your API Key (Recommended)

#### Application Restrictions:
- Select **HTTP referrers (web sites)**
- Add your allowed referrers:
  - `http://localhost:3000/*` (for local development)
  - `http://localhost:3001/*` (if using alternate port)
  - `https://yourdomain.com/*` (for production)

#### API Restrictions:
- Select **Restrict key**
- Choose the following APIs:
  - Places API
  - Geocoding API

### 5. Add API Key to Your Project

1. Copy your API key
2. Open your `.env.local` file (create it if it doesn't exist)
3. Add the following line:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
4. Replace `your_api_key_here` with your actual API key
5. Restart your development server

## Pricing Information

Google Maps Platform offers a **$200 monthly credit** for free, which covers:
- **Places Autocomplete**: ~28,000 requests/month
- **Geocoding API**: ~40,000 requests/month

For typical usage of GridCast Renewables, you should stay well within the free tier.

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to the application
3. In the address field, start typing an address
4. You should see autocomplete suggestions appear
5. Select an address from the dropdown
6. The latitude and longitude fields should auto-populate

## Troubleshooting

### Autocomplete not working?

1. **Check the browser console** for errors
2. **Verify API key** is correctly set in `.env.local`
3. **Restart the dev server** after adding the API key
4. **Check API is enabled** in Google Cloud Console
5. **Verify referrer restrictions** allow your domain

### "This API project is not authorized to use this API"

- Make sure you've enabled the **Places API** in your Google Cloud project

### "RefererNotAllowedMapError"

- Check your API key restrictions in Google Cloud Console
- Make sure your current domain is in the allowed referrers list

## Security Best Practices

1. ✅ **Never commit** your API key to version control
2. ✅ **Always use** application and API restrictions
3. ✅ **Monitor usage** in Google Cloud Console
4. ✅ **Set up billing alerts** to avoid unexpected charges
5. ✅ **Rotate keys** periodically for security

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## Support

If you encounter issues:
1. Check the [Google Maps Platform Status](https://status.cloud.google.com/)
2. Review the [Stack Overflow tag](https://stackoverflow.com/questions/tagged/google-maps)
3. Contact Google Cloud Support (if you have a support plan)

