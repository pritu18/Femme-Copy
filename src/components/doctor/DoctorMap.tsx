
import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { loadGoogleMapsScript } from '@/utils/loadGoogleMapsScript';

declare global {
  interface Window {
    google: any;
  }
}

export interface DoctorMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function DoctorMap({ center = { lat: 40.7128, lng: -74.006 }, zoom = 12 }: DoctorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Load Google Maps script
  useEffect(() => {
    const loadMap = async () => {
      try {
        await loadGoogleMapsScript();
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps', error);
      }
    };

    loadMap();
  }, []);

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

      // Add some example doctors (would be replaced with real data)
      const exampleDoctors = [
        { position: { lat: center.lat + 0.01, lng: center.lng + 0.01 }, title: 'Dr. Sarah Johnson - OBGYN' },
        { position: { lat: center.lat - 0.01, lng: center.lng - 0.01 }, title: 'Dr. Maria Rodriguez - Gynecologist' },
        { position: { lat: center.lat + 0.015, lng: center.lng - 0.015 }, title: 'Dr. Emily Chen - Women\'s Health' }
      ];

      // Create markers for example doctors
      const doctorMarkers = exampleDoctors.map(doctor => {
        const marker = new window.google.maps.Marker({
          position: doctor.position,
          map: mapInstance,
          title: doctor.title,
        });

        // Add click listener for info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><h3 class="font-medium">${doctor.title}</h3><p>Specialist in women's health</p><button class="text-femme-burgundy underline">Book Appointment</button></div>`
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
  }, [isLoaded]);

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
