import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchSet, fetchSetParts, fetchThemeName } from "@/lib/rebrickable";

// GET /api/sets — list all sets in collection
export async function GET() {
  const sets = await prisma.set.findMany({
    orderBy: { addedAt: "desc" },
    include: {
      _count: { select: { setParts: true } },
      setParts: {
        include: {
          inventories: true,
        },
      },
    },
  });

  const result = sets.map((s) => {
    const total = s.setParts.length;
    const missing = s.setParts.filter(
      (sp) => sp.inventories[0]?.status === "MISSING" || sp.inventories[0]?.status === "PARTIAL"
    ).length;
    return {
      id: s.id,
      setNum: s.setNum,
      name: s.name,
      year: s.year,
      theme: s.theme,
      numParts: s.numParts,
      imgUrl: s.imgUrl,
      addedAt: s.addedAt,
      totalParts: total,
      missingParts: missing,
    };
  });

  return NextResponse.json(result);
}

// POST /api/sets — add a set by set number
export async function POST(req: NextRequest) {
  const { setNum } = await req.json();
  if (!setNum) {
    return NextResponse.json({ error: "setNum is required" }, { status: 400 });
  }

  // Check if already in collection
  const existing = await prisma.set.findUnique({ where: { setNum: setNum.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Set already in collection" }, { status: 409 });
  }

  // Fetch from Rebrickable
  const rbSet = await fetchSet(setNum.trim());
  const themeName = await fetchThemeName(rbSet.theme_id);

  // Save set
  const set = await prisma.set.create({
    data: {
      setNum: rbSet.set_num,
      name: rbSet.name,
      year: rbSet.year,
      theme: themeName,
      numParts: rbSet.num_parts,
      imgUrl: rbSet.set_img_url,
    },
  });

  // Fetch all parts (paginated)
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const { results, next } = await fetchSetParts(rbSet.set_num, page);
    for (const item of results) {
      if (item.is_spare) continue;
      // Upsert part
      const part = await prisma.part.upsert({
        where: {
          partNum_colorId: {
            partNum: item.part.part_num,
            colorId: item.color.id,
          },
        },
        create: {
          partNum: item.part.part_num,
          name: item.part.name,
          color: item.color.name,
          colorId: item.color.id,
          imgUrl: item.part.part_img_url,
        },
        update: {
          name: item.part.name,
          color: item.color.name,
          imgUrl: item.part.part_img_url,
        },
      });

      // Create SetPart + default Inventory
      const setPart = await prisma.setPart.upsert({
        where: { setId_partId: { setId: set.id, partId: part.id } },
        create: { setId: set.id, partId: part.id, quantity: item.quantity },
        update: { quantity: item.quantity },
      });

      await prisma.inventory.upsert({
        where: { setPartId: setPart.id },
        create: { setPartId: setPart.id, status: "PRESENT", quantityOwned: item.quantity },
        update: {},
      });
    }
    hasMore = !!next;
    page++;
  }

  return NextResponse.json({ id: set.id, setNum: set.setNum, name: set.name }, { status: 201 });
}
