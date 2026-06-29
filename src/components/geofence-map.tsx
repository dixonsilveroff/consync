"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

interface LatLng {
  lat: number;
  lng: number;
}

interface GeofenceMapProps {
  corridorWidthMetres: number;
  initialCoords?: LatLng[];
  onChange: (coords: LatLng[]) => void;
}

function MapEvents({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function GeofenceMap({ corridorWidthMetres, initialCoords = [], onChange }: GeofenceMapProps) {
  const [points, setPoints] = useState<LatLng[]>(initialCoords);
  const [bufferPolygon, setBufferPolygon] = useState<LatLng[][]>([]);

  // Default to central Lagos if no points exist
  const center: [number, number] = points.length > 0 ? [points[0].lat, points[0].lng] : [6.5244, 3.3792];

  const handleAddPoint = (lat: number, lng: number) => {
    const newPoints = [...points, { lat, lng }];
    setPoints(newPoints);
    onChange(newPoints);
  };

  const handleClear = () => {
    setPoints([]);
    onChange([]);
    setBufferPolygon([]);
  };

  const handleUndo = () => {
    if (points.length === 0) return;
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    onChange(newPoints);
  };

  // Compute the corridor buffer polygon whenever points or width change
  useEffect(() => {
    if (points.length < 2) {
      setBufferPolygon([]);
      return;
    }

    try {
      const lineString = turf.lineString(points.map((p) => [p.lng, p.lat]));
      // Turf uses kilometers. Convert metres to km.
      const buffer = turf.buffer(lineString, corridorWidthMetres / 1000, { units: "kilometers" });
      
      if (buffer && buffer.geometry.type === "Polygon") {
        // Turf returns [lng, lat]. We need [lat, lng] for Leaflet
        const coords = buffer.geometry.coordinates[0].map((coord) => ({
          lat: coord[1],
          lng: coord[0],
        }));
        setBufferPolygon([coords]);
      } else {
        setBufferPolygon([]);
      }
    } catch (e) {
      console.error("Failed to generate buffer polygon", e);
      setBufferPolygon([]);
    }
  }, [points, corridorWidthMetres]);

  // We must return null on first render to avoid SSR issues with Leaflet window object
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px] bg-surface-container-high rounded-xl animate-pulse" />;

  return (
    <div className="relative z-0">
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-surface p-2 rounded-lg shadow-md border border-border-strong">
        <button
          type="button"
          onClick={handleUndo}
          className="text-xs font-mono font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 transition-colors text-left"
          disabled={points.length === 0}
        >
          [UNDO]
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-mono font-medium text-critical-red hover:text-red-700 px-3 py-1.5 transition-colors text-left"
          disabled={points.length === 0}
        >
          [CLEAR_MAP]
        </button>
      </div>

      <div className="h-[400px] rounded-xl overflow-hidden border border-outline/40">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onAddPoint={handleAddPoint} />
          
          {points.length > 0 && (
            <Polyline positions={points.map((p) => [p.lat, p.lng] as [number, number])} color="#4F46E5" weight={3} />
          )}

          {bufferPolygon.length > 0 && (
            <Polygon positions={bufferPolygon.map((poly) => poly.map((p) => [p.lat, p.lng] as [number, number]))} pathOptions={{ color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.2, stroke: false }} />
          )}
        </MapContainer>
      </div>
      
      <p className="text-[10px] text-text-muted font-mono mt-2 uppercase tracking-wide">
        Click on the map to draw the road centreline. The corridor width is visualized in blue.
      </p>
    </div>
  );
}
