import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, MapPinHouse } from "lucide-react";
import { renderToString } from "react-dom/server";
import type { TMapPoint } from "@/types";

interface MapProps {
  points: TMapPoint[];
  selectedPointId?: string | undefined;
}

export function MapWithCoords({ points, selectedPointId }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerMap = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([40.1772, 44.5035], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    const markersLayer = markersRef.current;
    markersLayer.clearLayers();
    markerMap.current.clear();

    if (!points.length) return;

    const bounds = L.latLngBounds([]);

    points.forEach((point) => {
      const isSelected = selectedPointId === point.id;

      const IconComponent = point.isBase ? MapPinHouse : MapPin;
      const colorClass = point.isBase
        ? isSelected
          ? "text-amber-500 fill-amber-500/20"
          : "text-indigo-600 fill-indigo-600/20"
        : isSelected
          ? "text-amber-500 fill-amber-500/20"
          : "text-primary fill-primary/20";

      const iconHtml = renderToString(
        <div
          className={`flex items-center justify-center transition-transform duration-300 ${isSelected ? "scale-125" : "scale-100"}`}
        >
          <IconComponent size={24} className={colorClass} strokeWidth={2.5} />
        </div>,
      );

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "bg-transparent border-none",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([point.lat, point.lng], { icon: customIcon });

      if (point.label) marker.bindPopup(`<b>${point.label}</b>`);

      marker.addTo(markersLayer);
      markerMap.current.set(point.id, marker);
      bounds.extend([point.lat, point.lng]);
    });

    if (!selectedPointId && points.length > 0) {
      mapRef.current.fitBounds(bounds.pad(0.2));
    }
  }, [points, selectedPointId]);

  useEffect(() => {
    // 1. Guard against missing map or ID
    if (!mapRef.current || !selectedPointId) return;

    const map = mapRef.current;
    const selectedPoint = points.find((p) => p.id === selectedPointId);

    // 2. Strict validation of coordinates
    if (
      !selectedPoint || 
      typeof selectedPoint.lat !== 'number' || 
      typeof selectedPoint.lng !== 'number' ||
      isNaN(selectedPoint.lat) || 
      isNaN(selectedPoint.lng)
    ) {
      console.warn("Map: Selected point has invalid coordinates", selectedPoint);
      return;
    }

    // 3. Optional: Wrap in requestAnimationFrame to ensure DOM/Leaflet state is ready
    const timer = setTimeout(() => {
      map.flyTo([selectedPoint.lat, selectedPoint.lng], 16, { 
        duration: 1.5,
        animate: true 
      });

      const marker = markerMap.current.get(selectedPointId);
      if (marker) {
        marker.openPopup();
      }
    }, 100); // Small delay to let the marker-render effect finish

    return () => clearTimeout(timer);
  }, [selectedPointId, points]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl border shadow-md relative z-0"
    />
  );
}

export default MapWithCoords