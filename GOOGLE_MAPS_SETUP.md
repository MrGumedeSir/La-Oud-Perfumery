# Google Maps API Setup Instructions

## How to Get Your Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project**
   - Click "Select a project" → "New Project"
   - Name it "La'Oud Perfumery Maps"
   - Click "Create"

3. **Enable the Maps JavaScript API**
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

5. **Secure Your API Key (Optional but Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:5500/*`, `yourdomain.com/*`)

## Update Your HTML Files

Replace `YOUR_API_KEY` in these files with your actual API key:
- `contact.html` (line 16)

## Example:
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY_HERE&callback=initMap"></script>
```

## Free Usage Limits
- Google Maps API provides $200 free credit per month
- This covers approximately 28,000 map loads
- Perfect for small to medium websites

## Troubleshooting
- If maps don't load, check browser console for errors
- Ensure API key is correctly placed
- Verify Maps JavaScript API is enabled
- Check if billing is set up (required for production use)
