import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, MapPinHouse } from "lucide-react"; // Added MapPinHouse
import { renderToString } from "react-dom/server";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  isBase?: boolean;
  label?: string;
}

interface MapProps {
  points: MapPoint[];
  selectedPoint?: MapPoint;
  height?: string;
}

export function MapWithCoords({ points, selectedPoint, height = "500px" }: MapProps) {
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
      const isSelected = selectedPoint?.id === point.id;
      
      // Determine which Icon and Color to use
      // Base points get a distinct color (e.g., 'text-indigo-600')
      const IconComponent = point.isBase ? MapPinHouse : MapPin;
      const colorClass = point.isBase 
        ? (isSelected ? 'text-amber-500 fill-amber-500/20' : 'text-indigo-600 fill-indigo-600/20')
        : (isSelected ? 'text-amber-500 fill-amber-500/20' : 'text-primary fill-primary/20');

      const iconHtml = renderToString(
        <div className={`flex items-center justify-center transition-transform duration-300 ${isSelected ? 'scale-125' : 'scale-100'}`}>
          <IconComponent 
            size={24} 
            className={colorClass} 
            strokeWidth={2.5}
          />
        </div>
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

    if (!selectedPoint && points.length > 0) {
      mapRef.current.fitBounds(bounds.pad(0.2));
    }
  }, [points, selectedPoint]);

  useEffect(() => {
    if (!mapRef.current || !selectedPoint) return;
    const map = mapRef.current;
    const marker = markerMap.current.get(selectedPoint.id);

    map.flyTo([selectedPoint.lat, selectedPoint.lng], 16, { duration: 1.5 });
    if (marker) marker.openPopup();
  }, [selectedPoint]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl border shadow-md relative z-0"
    />
  );
}