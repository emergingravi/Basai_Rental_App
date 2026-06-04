import React, { useEffect, useRef } from "react";

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange?: (lat: number, lng: number) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  lat = 27.7172,
  lng = 85.324,
  onChange,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        const L = await import("leaflet");

        // Fix invisible marker issue in Vite/React
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        // Load CSS once
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

          document.head.appendChild(link);
        }

        if (!mounted || !mapRef.current) return;

        const map = L.map(mapRef.current).setView([lat, lng], 15);

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
          }
        ).addTo(map);

        const marker = L.marker([lat, lng], {
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const position = marker.getLatLng();

          onChange?.(
            Number(position.lat.toFixed(6)),
            Number(position.lng.toFixed(6))
          );
        });

        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;

          marker.setLatLng([lat, lng]);

          onChange?.(
            Number(lat.toFixed(6)),
            Number(lng.toFixed(6))
          );
        });

        mapInstance.current = map;
        markerInstance.current = marker;
      } catch (error) {
        console.error("Failed to initialize Leaflet:", error);
      }
    };

    initMap();

    return () => {
      mounted = false;

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update marker position if parent changes coordinates
  useEffect(() => {
    if (!mapInstance.current || !markerInstance.current) return;

    markerInstance.current.setLatLng([lat, lng]);
    mapInstance.current.panTo([lat, lng]);
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{
        height: "300px",
      }}
    />
  );
};

export default MapPicker;