import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/inventory/[id] — update status of a part
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, quantityOwned } = body;

  const validStatuses = ["PRESENT", "MISSING", "PARTIAL"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.inventory.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(quantityOwned !== undefined && { quantityOwned }),
    },
  });

  return NextResponse.json(updated);
}
