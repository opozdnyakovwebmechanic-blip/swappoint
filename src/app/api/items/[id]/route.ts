import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, status: { in: ["PUBLISHED", "RESERVED", "EXCHANGE_PENDING"] } },
    select: { id: true, title: true, description: true, category: true, size: true, condition: true, pointsPrice: true, district: true, color: true, images: { orderBy: { sortOrder: "asc" } }, owner: { select: { name: true } } },
  });
  if (!item) return NextResponse.json({ error: "Вещь не найдена." }, { status: 404 });
  return NextResponse.json({ item });
}
