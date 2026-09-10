import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { calculatePoints } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  title: z.string().trim().min(3).max(100),
  category: z.enum(["Платья", "Верхняя одежда", "Брюки и юбки", "Рубашки и блузы", "Трикотаж", "Обувь", "Сумки", "Аксессуары"]),
  brand: z.string().trim().max(80).optional(),
  brandTier: z.enum(["BASE", "MID", "PREMIUM"]).default("BASE"),
  size: z.string().trim().min(1).max(30),
  condition: z.enum(["Как новое", "Отличное", "Хорошее"]),
  material: z.string().trim().min(2).max(100),
  color: z.string().trim().min(2).max(40),
  district: z.string().trim().min(2).max(80),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().trim().min(10).max(2000),
  imageUrls: z.array(z.string().url()).min(3).max(8),
});

export async function GET() {
  const items = await prisma.item.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, category: true, size: true, condition: true, pointsPrice: true, district: true, color: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Войдите в аккаунт, чтобы опубликовать вещь." }, { status: 401 });
  const owner = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!owner) return NextResponse.json({ error: "Аккаунт не найден. Войдите снова." }, { status: 401 });
  const parsed = itemSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Проверьте обязательные поля и добавьте от 3 до 8 фотографий." }, { status: 400 });

  const activeCount = await prisma.item.count({ where: { ownerId: owner.id, status: { in: ["PUBLISHED", "RESERVED", "EXCHANGE_PENDING"] } } });
  if (activeCount >= 20) return NextResponse.json({ error: "Можно одновременно публиковать не более 20 активных вещей." }, { status: 409 });

  const input = parsed.data;
  const price = calculatePoints(input);
  const item = await prisma.item.create({
    data: {
      ownerId: owner.id,
      title: input.title,
      description: input.description,
      audience: "ADULT",
      category: input.category,
      subcategory: input.category,
      brand: input.brand || null,
      brandTier: input.brandTier,
      size: input.size,
      material: input.material,
      color: input.color,
      condition: input.condition,
      district: input.district,
      latitude: input.latitude,
      longitude: input.longitude,
      pointsPrice: price.points,
      pricingNote: price.note,
      images: { create: input.imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) },
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ item, points: price.points }, { status: 201 });
}
