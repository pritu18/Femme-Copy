
let scriptLoaded = false;

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) {
      resolve();
      return;
    }
    
    // Check if API key is provided
    if (!apiKey) {
      console.warn('Google Maps API key is not provided. Map functionality will be limited.');
      // We'll still try to load the script without a key, which will show a development warning overlay
    }
    
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = (err) => {
      console.error('Failed to load Google Maps script:', err);
      reject(err);
    };
    document.body.appendChild(script);
  });
}
