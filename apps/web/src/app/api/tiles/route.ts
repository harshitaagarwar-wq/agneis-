import { NextResponse } from "next/server";
import { createTileInputSchema } from "@aegis/shared";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ tiles: [] }, { status: 200 });
  }

  const tiles = await prisma.tile.findMany({
    where: { userId: session.user.id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ tiles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createTileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const count = await prisma.tile.count({ where: { userId: session.user.id } });
  const tile = await prisma.tile.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      url: parsed.data.url,
      icon: parsed.data.icon ?? null,
      pinned: parsed.data.pinned ?? true,
      position: count,
    },
  });

  return NextResponse.json({ tile }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing tile id" }, { status: 400 });
  }

  await prisma.tile.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}
