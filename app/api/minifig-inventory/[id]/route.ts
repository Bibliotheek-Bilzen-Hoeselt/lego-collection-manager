import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/minifig-inventory/[id] — update status of a minifig in a set
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  const validStatuses = ["PRESENT", "MISSING"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.setMinifig.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
