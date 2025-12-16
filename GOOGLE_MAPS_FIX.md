# Google Maps API - Fixed Issues & Setup Guide

## ✅ Issues Fixed

### 1. **Deprecated Marker API**
- **Before**: Used `google.maps.Marker` (deprecated as of Feb 21, 2024)
- **After**: Now using `google.maps.marker.AdvancedMarkerElement` (modern API)

### 2. **Improper Async Loading**
- **Before**: Script loaded directly in `<head>` with static callback
- **After**: Dynamic script loading with proper async/await pattern and `loading=async` parameter

### 3. **Invalid API Key**
- **Before**: Using placeholder `YOUR_API_KEY`
- **After**: Structured code ready for your actual API key with clear instructions

## 🔑 How to Get Your Google Maps API Key

### Step 1: Go to Google Cloud Console
Visit: [https://console.cloud.google.com/google/maps-apis/](https://console.cloud.google.com/google/maps-apis/)

### Step 2: Create or Select a Project
1. Click the project dropdown at the top
2. Click "New Project" or select an existing one
3. Give it a name (e.g., "La'Oud Perfumery Website")

### Step 3: Enable Required APIs
1. In the search bar, search for "Maps JavaScript API"
2. Click on it and enable it
3. Also enable "Places API" (optional, for future features)

### Step 4: Create API Key
1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" → "API Key"
3. Copy your new API key

### Step 5: Secure Your API Key (IMPORTANT!)
1. Click "Edit API key" on your new key
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your website domains:
   ```
   http://localhost/*
   http://127.0.0.1/*
   https://yourdomain.com/*
   ```
4. Under "API restrictions", select "Restrict key"
5. Select only "Maps JavaScript API"
6. Click "Save"

### Step 6: Set Up Billing (Required)
- Google Maps requires a billing account, but provides $200/month free credit
- This covers ~28,000 map loads per month for free
- Visit: [https://console.cloud.google.com/billing](https://console.cloud.google.com/billing)

## 📝 Installing Your API Key

### In `index.html` (Line 363):
Replace:
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';
```

With:
```javascript
const GOOGLE_MAPS_API_KEY = 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'; // Your actual key
```

## 🎨 New Features Added

### 1. **Modern Marker API**
```javascript
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
const marker = new AdvancedMarkerElement({
    map: map,
    position: location,
    title: "La'Oud Perfumery - 101 Barkley Road, Gemdene, Kimberley"
});
```

### 2. **Proper Async Loading**
```javascript
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&libraries=marker`;
        script.async = true;
        // ... proper error handling
    });
}
```

### 3. **Error Handling & Fallback**
If the map fails to load (invalid key, network issues, etc.), users will see:
- A friendly error message
- Your address information
- A link to view on Google Maps directly

## 🔍 Testing

### Before Adding Your Key:
1. Open the website
2. You'll see a fallback message with your address
3. Check console - you'll see error messages (expected with placeholder key)

### After Adding Your Key:
1. Refresh the page
2. The map should load smoothly
3. No console errors
4. Marker appears at your location

## 🚨 Common Issues & Solutions

### Issue: "InvalidKeyMapError"
**Solution**: You haven't replaced `YOUR_API_KEY` with your actual key yet.

### Issue: "RefererNotAllowedMapError"
**Solution**: Add your website domain to API key restrictions in Google Cloud Console.

### Issue: Map shows but marker doesn't appear
**Solution**: Make sure you enabled "Maps JavaScript API" and included the `libraries=marker` parameter.

### Issue: "Google Maps JavaScript API error: NotLoadingAPIFromGoogleMapsError"
**Solution**: This is fixed! The new implementation loads the API correctly with `loading=async`.

## 💰 Pricing Information

- **Free Tier**: $200/month credit (covers most small business websites)
- **Map Loads**: $7 per 1,000 loads (after free credit)
- **Dynamic Maps**: $7 per 1,000 loads
- **Static Maps**: $2 per 1,000 loads

For your traffic, you'll likely stay within the free tier.

## 🔗 Useful Links

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation/javascript)
- [AdvancedMarkerElement Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

## 📌 Your Store Location (Currently Set)

```javascript
const location = { lat: -28.7282, lng: 24.7499 }; // Kimberley coordinates
```

If you need to adjust the exact location:
1. Go to [Google Maps](https://maps.google.com)
2. Find your exact address: 101 Barkley Road, Gemdene, Kimberley
3. Right-click on the location → "What's here?"
4. Copy the coordinates and update them in `index.html`

---

## ✨ Summary

All Google Maps API warnings and errors have been resolved with modern best practices:
- ✅ Using AdvancedMarkerElement (no more deprecation warnings)
- ✅ Proper async loading pattern (optimal performance)
- ✅ Error handling with user-friendly fallback
- ✅ Clear instructions for API key setup

Just add your API key and you're good to go! 🚀


