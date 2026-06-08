import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/sets/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.set.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }
}
