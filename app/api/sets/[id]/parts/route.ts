import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sets/[id]/parts — get all parts for a set with inventory status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const set = await prisma.set.findUnique({
    where: { id },
    include: {
      setParts: {
        include: {
          part: true,
          inventories: true,
        },
        orderBy: [{ part: { color: "asc" } }, { part: { name: "asc" } }],
      },
    },
  });

  if (!set) {
    return NextResponse.json({ error: "Set not found" }, { status: 404 });
  }

  const parts = set.setParts.map((sp) => ({
    setPartId: sp.id,
    partNum: sp.part.partNum,
    name: sp.part.name,
    color: sp.part.color,
    imgUrl: sp.part.imgUrl,
    quantity: sp.quantity,
    status: sp.inventories[0]?.status ?? "PRESENT",
    quantityOwned: sp.inventories[0]?.quantityOwned ?? sp.quantity,
    inventoryId: sp.inventories[0]?.id ?? null,
  }));

  return NextResponse.json({
    id: set.id,
    setNum: set.setNum,
    name: set.name,
    year: set.year,
    theme: set.theme,
    imgUrl: set.imgUrl,
    numParts: set.numParts,
    parts,
  });
}

// DELETE /api/sets/[id] — remove set from collection
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.set.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
