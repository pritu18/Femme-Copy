
import React, { useEffect, useRef } from "react";
import { loadGoogleMapsScript } from "@/utils/loadGoogleMapsScript";
import { Card } from "@/components/ui/card";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  distance: string;
  lat: number;
  lng: number;
}

interface DoctorMapProps {
  doctors: Doctor[];
  apiKey: string;
}

const DoctorMap: React.FC<DoctorMapProps> = ({ doctors, apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey) return;
    let map: any;

    loadGoogleMapsScript(apiKey).then(() => {
      if (!mapRef.current) return;
      map = new window.google.maps.Map(mapRef.current, {
        center: { lat: doctors[0]?.lat || 0, lng: doctors[0]?.lng || 0 },
        zoom: 13,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#e8f2e6" }]
          }
        ]
      });

      // Create bounds object to fit all markers
      const bounds = new window.google.maps.LatLngBounds();

      doctors.forEach(doctor => {
        const position = { lat: doctor.lat, lng: doctor.lng };
        
        // Add marker
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: doctor.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#D291BC",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#7D1F27",
            scale: 8,
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; color: #7D1F27; font-weight: bold;">${doctor.name}</h3>
              <p style="margin: 4px 0;"><strong>Specialty:</strong> ${doctor.specialty}</p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${doctor.location}</p>
              <p style="margin: 4px 0;"><strong>Distance:</strong> ${doctor.distance}</p>
            </div>
          `
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        bounds.extend(position);
      });

      // Fit map to bounds if we have doctors
      if (doctors.length > 0) {
        map.fitBounds(bounds);
        
        // Add some padding to the bounds
        const padding = { top: 50, right: 50, bottom: 50, left: 50 };
        map.fitBounds(bounds, padding);
      }
    });
  }, [apiKey, doctors]);

  return (
    <Card className="overflow-hidden shadow-lg border-femme-taupe border-opacity-50 mb-4">
      <div
        ref={mapRef}
        className="w-full h-[350px] rounded-md"
        aria-label="Google Map of gynecologists"
      />
    </Card>
  );
};

export default DoctorMap;
