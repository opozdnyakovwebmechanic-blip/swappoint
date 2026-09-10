"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from "react-leaflet";
import Link from "next/link";

export type MapListing = { id: string; title: string; points: number; district: string; latitude: number | null; longitude: number | null };
type Coordinates = { latitude: number; longitude: number };

const astrakhanCenter: [number, number] = [46.3497, 48.0408];
const districtFallbacks: Record<string, [number, number]> = {
  "центр": [46.3497, 48.0408], "кировский": [46.355, 48.042], "советский": [46.327, 48.015], "ленинский": [46.38, 48.04], "трусовский": [46.32, 47.99],
};
function fallbackPoint(district: string): [number, number] { return districtFallbacks[district.trim().toLowerCase()] ?? astrakhanCenter; }

export function ItemsMap({ listings }: { listings: MapListing[] }) {
  return <MapContainer className="leaflet-map" center={astrakhanCenter} zoom={12} scrollWheelZoom><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{listings.map((item) => { const point: [number, number] = item.latitude !== null && item.longitude !== null ? [item.latitude, item.longitude] : fallbackPoint(item.district); return <CircleMarker key={item.id} center={point} radius={10} pathOptions={{ color: "#1e4b36", fillColor: "#e36c49", fillOpacity: 1, weight: 2 }}><Popup><b>{item.title}</b><br/>{item.district} · {item.points} баллов<br/><Link href={`/item/${item.id}`}>Открыть вещь</Link></Popup></CircleMarker>; })}</MapContainer>;
}

function ClickPicker({ value, onChange }: { value: Coordinates | null; onChange: (coordinates: Coordinates) => void }) {
  useMapEvents({ click(event) { onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng }); } });
  return value ? <CircleMarker center={[value.latitude, value.longitude]} radius={10} pathOptions={{ color: "#1e4b36", fillColor: "#e36c49", fillOpacity: 1, weight: 2 }} /> : null;
}

export function LocationPicker({ value, onChange }: { value: Coordinates | null; onChange: (coordinates: Coordinates) => void }) {
  return <MapContainer className="location-picker" center={value ? [value.latitude, value.longitude] : astrakhanCenter} zoom={12} scrollWheelZoom><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><ClickPicker value={value} onChange={onChange}/></MapContainer>;
}
