
import React, { useEffect, useRef } from "react";
import { loadGoogleMapsScript } from "@/utils/loadGoogleMapsScript";

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
      });

      doctors.forEach(doctor => {
        new window.google.maps.Marker({
          position: { lat: doctor.lat, lng: doctor.lng },
          map,
          title: doctor.name,
        });
      });
    });
  }, [apiKey, doctors]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "300px", borderRadius: "0.5rem", marginBottom: "1rem" }}
      aria-label="Google Map of gynecologists"
    />
  );
};

export default DoctorMap;
