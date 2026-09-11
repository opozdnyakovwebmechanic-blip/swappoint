import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, name: true, city: true, district: true, pointsAvailable: true, createdAt: true, items: { where: { status: { in: ["PUBLISHED", "RESERVED", "EXCHANGE_PENDING"] } }, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } }, orderBy: { createdAt: "desc" } } } });
  if (!user) return NextResponse.json({ error: "Аккаунт не найден." }, { status: 404 });
  return NextResponse.json({ user });
}
