import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/sets/[slug]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    await prisma.set.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }
}
