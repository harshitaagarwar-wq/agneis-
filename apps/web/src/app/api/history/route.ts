import { NextResponse } from "next/server";
import { createSearchHistoryInputSchema } from "@aegis/shared";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ history: [] }, { status: 200 });
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = createSearchHistoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const entry = await prisma.searchHistory.create({
    data: {
      userId: session.user.id,
      query: parsed.data.query,
      mode: parsed.data.mode,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
