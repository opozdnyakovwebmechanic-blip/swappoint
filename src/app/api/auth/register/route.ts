import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(10).max(20),
  isAdultConfirmed: z.literal(true),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Проверьте заполнение формы." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone: parsed.data.phone }] } });
  if (existing) return NextResponse.json({ error: "Email или номер телефона уже зарегистрированы." }, { status: 409 });
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      passwordHash: await hash(parsed.data.password, 12),
      isAdultConfirmed: true,
    },
    select: { id: true, email: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
