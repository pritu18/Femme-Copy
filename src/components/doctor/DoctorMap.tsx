
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMapsScript';

// Import the Google Maps type declaration
declare global {
  interface Window {
    google: any;
  }
}

export interface DoctorMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  apiKey?: string;
  doctors?: Array<{
    id: string;
    name: string;
    specialty: string;
    location: string;
    lat: number;
    lng: number;
  }>;
}

export function DoctorMap({ 
  center = { lat: 40.7128, lng: -74.006 }, 
  zoom = 12,
  apiKey,
  doctors
}: DoctorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Load Google Maps script
  useEffect(() => {
    const loadMap = async () => {
      try {
        // Pass the API key to the loadGoogleMapsScript function
        await loadGoogleMapsScript(apiKey || "");
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps', error);
      }
    };

    loadMap();
  }, [apiKey]);

  // Initialize map once script is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        fullscreenControl: false,
      });
      setMap(mapInstance);

      // Add doctor markers if provided, otherwise use example data
      const markersData = doctors || [
        { 
          id: '1',
          name: 'Dr. Sarah Johnson',
          specialty: 'OBGYN',
          location: 'Women\'s Health Clinic',
          lat: center.lat + 0.01, 
          lng: center.lng + 0.01 
        },
        { 
          id: '2',
          name: 'Dr. Maria Rodriguez',
          specialty: 'Gynecologist',
          location: 'City Medical Center',
          lat: center.lat - 0.01, 
          lng: center.lng - 0.01 
        },
        { 
          id: '3',
          name: 'Dr. Emily Chen',
          specialty: 'Women\'s Health',
          location: 'Family Care Clinic',
          lat: center.lat + 0.015, 
          lng: center.lng - 0.015 
        }
      ];

      // Create markers for doctors
      const doctorMarkers = markersData.map(doctor => {
        const marker = new window.google.maps.Marker({
          position: { lat: doctor.lat, lng: doctor.lng },
          map: mapInstance,
          title: doctor.name,
        });

        // Add click listener for info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2">
            <h3 class="font-medium">${doctor.name}</h3>
            <p>${doctor.specialty} at ${doctor.location}</p>
            <button class="text-femme-burgundy underline">Book Appointment</button>
          </div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        return marker;
      });

      setMarkers(doctorMarkers);
    } catch (error) {
      console.error('Error initializing map', error);
    }
  }, [isLoaded, center, zoom, doctors]);

  // Update map center when props change
  useEffect(() => {
    if (!map) return;
    map.setCenter(center);
  }, [center, map]);

  // Clean up markers and map instance
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-femme-beige/20 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-femme-burgundy" />
        <span className="ml-2 text-femme-burgundy">Loading map...</span>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="h-64 w-full rounded-lg shadow-md" />
  );
}

export default DoctorMap;
