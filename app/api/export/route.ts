import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toRow(values: unknown[]): string[] {
  return values.map((v) => String(v ?? ""));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const setId = searchParams.get("setId") ?? undefined;

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

  const missingMinifigs = await prisma.setMinifig.findMany({
    where: { status: "MISSING", setId },
    include: { minifig: true, set: true },
    orderBy: [{ set: { setNum: "asc" } }, { minifig: { name: "asc" } }],
  });

  if (inventories.length === 0 && missingMinifigs.length === 0) {
    return new NextResponse("Geen vermiste onderdelen gevonden", { status: 200 });
  }

  const header = ["Type", "Set nummer", "Set naam", "Nr", "Naam", "Kleur", "Benodigde aantal", "Aanwezig aantal", "Status"];

  const partRows = inventories.map((inv) => toRow([
    "Onderdeel",
    inv.setPart.set.setNum,
    inv.setPart.set.name,
    inv.setPart.part.partNum,
    inv.setPart.part.name,
    inv.setPart.part.color,
    inv.setPart.quantity,
    inv.quantityOwned,
    inv.status,
  ]));

  const minifigRows = missingMinifigs.map((sm) => toRow([
    "Minifig",
    sm.set.setNum,
    sm.set.name,
    sm.minifig.figNum,
    sm.minifig.name,
    "-",
    sm.quantity,
    0,
    sm.status,
  ]));

  const allRows = [header, ...partRows, ...minifigRows];
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
