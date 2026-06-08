import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/export?setId=xxx  — CSV of missing parts (all sets if no setId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const setId = searchParams.get("setId");

  const inventories = await prisma.inventory.findMany({
    where: {
      status: { in: ["MISSING", "PARTIAL"] },
      setPart: {
        setId: setId ?? undefined,
      },
    },
    include: {
      setPart: {
        include: {
          part: true,
          set: true,
        },
      },
    },
    orderBy: [{ setPart: { set: { setNum: "asc" } } }, { setPart: { part: { name: "asc" } } }],
  });

  if (inventories.length === 0) {
    return new NextResponse("No missing parts found", { status: 200 });
  }

  const rows = [
    ["Set nummer", "Set naam", "Onderdeel nr", "Onderdeel naam", "Kleur", "Benodigde aantal", "Aanwezig aantal", "Status"],
    ...inventories.map((inv) => [
      inv.setPart.set.setNum,
      inv.setPart.set.name,
      inv.setPart.part.partNum,
      inv.setPart.part.name,
      inv.setPart.part.color,
      inv.setPart.quantity,
      inv.quantityOwned,
      inv.status,
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  const filename = setId ? `vermiste-onderdelen-set.csv` : `vermiste-onderdelen-alle-sets.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
