"use client";
import { Item, ItemPage, items } from "@/components/app";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { id } = useParams<{ id: string }>(); const [remote, setRemote] = useState<Item | null>(null);
  useEffect(() => { if (items.some((x) => x.id === id)) return; fetch(`/api/items/${id}`).then((r) => r.ok ? r.json() : null).then((result) => { if (!result) return; const x = result.item; const images = x.images.map((image: { imageUrl: string }) => image.imageUrl); setRemote({ id: x.id, title: x.title, category: x.category, size: x.size, condition: x.condition, points: x.pointsPrice, district: x.district, image: images[0] || "/items/linen-dress.png", images, owner: x.owner.name, color: x.color }); }).catch(() => undefined); }, [id]);
  const item = items.find((x) => x.id === id) || remote;
  return item ? <ItemPage item={item} /> : <p className="page-loading">Загружаем вещь…</p>;
}
