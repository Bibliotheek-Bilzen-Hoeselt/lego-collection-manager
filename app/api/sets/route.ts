import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchSet, fetchSetParts, fetchSetMinifigs, fetchThemeName } from "@/lib/rebrickable";

export async function GET() {
  const sets = await prisma.set.findMany({
    orderBy: { addedAt: "desc" },
    include: {
      setParts: { include: { inventories: true } },
      setMinifigs: true,
    },
  });

  const result = sets.map((s) => {
    const missingParts = s.setParts.filter(
      (sp) => sp.inventories[0]?.status === "MISSING" || sp.inventories[0]?.status === "PARTIAL"
    ).length;
    const missingMinifigs = s.setMinifigs.filter(
      (sm) => sm.status === "MISSING" || sm.status === "PARTIAL"
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
      totalParts: s.setParts.length,
      missingParts: missingParts + missingMinifigs,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { setNum } = await req.json();
  if (!setNum) {
    return NextResponse.json({ error: "setNum is required" }, { status: 400 });
  }

  // If set already exists, sync its minifigs and return
  const existing = await prisma.set.findUnique({ where: { setNum: setNum.trim() } });
  if (existing) {
    await syncMinifigs(existing.id, existing.setNum);
    return NextResponse.json(
      { error: "Set already in collection", id: existing.id },
      { status: 409 }
    );
  }

  const rbSet = await fetchSet(setNum.trim());
  const themeName = await fetchThemeName(rbSet.theme_id);

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

  // Fetch and save parts (paginated)
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const { results, next } = await fetchSetParts(rbSet.set_num, page);
    for (const item of results) {
      if (item.is_spare) continue;
      const part = await prisma.part.upsert({
        where: { partNum_colorId: { partNum: item.part.part_num, colorId: item.color.id } },
        create: {
          partNum: item.part.part_num,
          name: item.part.name,
          color: item.color.name,
          colorId: item.color.id,
          imgUrl: item.part.part_img_url,
        },
        update: { name: item.part.name, color: item.color.name, imgUrl: item.part.part_img_url },
      });
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

  await syncMinifigs(set.id, rbSet.set_num);

  return NextResponse.json({ id: set.id, setNum: set.setNum, name: set.name }, { status: 201 });
}

async function syncMinifigs(setId: string, setNum: string) {
  const minifigs = await fetchSetMinifigs(setNum);
  for (const fig of minifigs) {
    const minifig = await prisma.minifig.upsert({
      where: { figNum: fig.set_num },
      create: {
        figNum: fig.set_num,
        name: fig.set_name,
        imgUrl: fig.set_img_url,
      },
      update: { name: fig.set_name, imgUrl: fig.set_img_url },
    });
    await prisma.setMinifig.upsert({
      where: { setId_minifigId: { setId, minifigId: minifig.id } },
      create: { setId, minifigId: minifig.id, quantity: fig.quantity, status: "PRESENT" },
      update: { quantity: fig.quantity },
    });
  }
}
