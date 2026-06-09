import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const setId = searchParams.get("setId") ?? undefined;

  // Missing parts
  const inventories = await prisma.inventory.findMany({
    where: {
      status: { in: ["MISSING", "PARTIAL"] },
      setPart: { setId },
    },
    include: {
      setPart: { include: { part: true, set: true } },
    },
    orderBy: [{ setPart: { set: { setNum: "asc" } } }, { setPart: { part: { name: "asc" } } }],
  });

  // Missing minifigs
  const missingMinifigs = await prisma.setMinifig.findMany({
    where: { status: "MISSING", setId },
    include: { minifig: true, set: true },
    orderBy: [{ set: { setNum: "asc" } }, { minifig: { name: "asc" } }],
  });

  if (inventories.length === 0 && missingMinifigs.length === 0) {
    return new NextResponse("Geen vermiste onderdelen gevonden", { status: 200 });
  }

  const header = ["Type", "Set nummer", "Set naam", "Nr", "Naam", "Kleur", "Benodigde aantal", "Aanwezig aantal", "Status"];

  const partRows = inventories.map((inv) => [
    "Onderdeel",
    inv.setPart.set.setNum,
    inv.setPart.set.name,
    inv.setPart.part.partNum,
    inv.setPart.part.name,
    inv.setPart.part.color,
    String(inv.setPart.quantity),
    String(inv.quantityOwned),
    inv.status,
  ]);

  const minifigRows = missingMinifigs.map((sm) => [
    "Minifig",
    sm.set.setNum,
    sm.set.name,
    sm.minifig.figNum,
    sm.minifig.name,
    "-",
    String(sm.quantity),
    "0",
    sm.status,
  ]);

  const allRows: string[][] = [header, ...partRows, ...minifigRows];
  const csv = allRows
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const filename = setId ? "vermiste-onderdelen-set.csv" : "vermiste-onderdelen-alle-sets.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
