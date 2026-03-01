"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix missing marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Ozone One Market — ตลาดโอโซนวัน, ดอนเมือง, กรุงเทพฯ
const OZONE_CENTER: [number, number] = [13.834329692653869, 100.47686786137426];

interface MapPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: string, lng: string) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat.toString(), e.latlng.lng.toString());
    },
  });
  return null;
}

// Recenter map when position is first set (e.g. from initialData)
function AutoCenter({ lat, lng }: { lat: string; lng: string }) {
  const map = useMap();
  const centered = useRef(false);
  useEffect(() => {
    if (!centered.current && lat && lng) {
      map.setView([parseFloat(lat), parseFloat(lng)], map.getZoom());
      centered.current = true;
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const position: [number, number] | null =
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={position ?? OZONE_CENTER}
        zoom={18}
        minZoom={15}
        maxZoom={20}
        scrollWheelZoom
        className="h-full w-full z-10"
        style={{ height: "100%", minHeight: "300px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <AutoCenter lat={lat} lng={lng} />
        {position && <Marker position={position} />}
      </MapContainer>

      {/* Floating hint */}
      <div className="pointer-events-none absolute left-1/2 top-4 z-[400] -translate-x-1/2 rounded-full border border-slate-100 bg-white/90 px-4 py-2 shadow-md backdrop-blur-sm">
        <p className="text-xs font-bold text-slate-700">
          👇 คลิกบนแผนที่เพื่อปักหมุดตำแหน่งบูธ
        </p>
      </div>

      {/* Reset button */}
      {position && (
        <button
          type="button"
          onClick={() => onChange("", "")}
          className="absolute bottom-4 right-4 z-[400] rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-red-500 shadow-md backdrop-blur-sm hover:bg-red-50 transition-colors"
        >
          ล้างหมุด
        </button>
      )}
    </div>
  );
}
