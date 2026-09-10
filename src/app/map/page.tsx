"use client";

import { Layout } from "@/components/app";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { MapListing } from "@/components/leaflet-map";

const ItemsMap = dynamic(() => import("@/components/leaflet-map").then((module) => module.ItemsMap), { ssr: false, loading: () => <div className="map-loading">Загружаем карту…</div> });

export default function Page() {
  const [listings, setListings] = useState<MapListing[]>([]);
  useEffect(() => { fetch("/api/items").then((response) => response.ok ? response.json() : { items: [] }).then(({ items }) => setListings(items.map((item: { id: string; title: string; pointsPrice: number; district: string }) => ({ id: item.id, title: item.title, points: item.pointsPrice, district: item.district })))).catch(() => undefined); }, []);
  return <Layout><section className="map-page"><div><p className="eyebrow">Карта вещей</p><h1>Находите вещи<br/>в своём районе</h1><p>Карта показывает район или ориентировочную точку. Точный адрес открывается только после согласования встречи в чате.</p><p className="map-count">Сейчас на карте: {listings.length} {listings.length === 1 ? "вещь" : "вещей"}</p></div><ItemsMap listings={listings}/></section></Layout>;
}
