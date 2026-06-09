import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const set = await prisma.set.findUnique({
    where: { slug },
    include: {
      setParts: {
        include: { part: true, inventories: true },
        orderBy: [{ part: { color: "asc" } }, { part: { name: "asc" } }],
      },
      setMinifigs: {
        include: { minifig: true },
        orderBy: { minifig: { name: "asc" } },
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

  const minifigs = set.setMinifigs.map((sm) => ({
    setMinifigId: sm.id,
    figNum: sm.minifig.figNum,
    name: sm.minifig.name,
    numParts: sm.minifig.numParts,
    imgUrl: sm.minifig.imgUrl,
    quantity: sm.quantity,
    status: sm.status,
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
    minifigs,
  });
}
