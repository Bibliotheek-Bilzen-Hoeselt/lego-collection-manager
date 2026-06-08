import { NextRequest, NextResponse } from "next/server";
import { fetchSet, fetchThemeName } from "@/lib/rebrickable";

// GET /api/rebrickable/preview?setNum=xxx
export async function GET(req: NextRequest) {
  const setNum = req.nextUrl.searchParams.get("setNum");
  if (!setNum) {
    return NextResponse.json({ error: "setNum is required" }, { status: 400 });
  }

  try {
    const rbSet = await fetchSet(setNum.trim());
    const theme = await fetchThemeName(rbSet.theme_id);
    return NextResponse.json({
      setNum: rbSet.set_num,
      name: rbSet.name,
      year: rbSet.year,
      theme,
      numParts: rbSet.num_parts,
      imgUrl: rbSet.set_img_url,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Set niet gevonden" },
      { status: 404 }
    );
  }
}
