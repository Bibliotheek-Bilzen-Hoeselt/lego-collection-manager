const REBRICKABLE_BASE = "https://rebrickable.com/api/v3/lego";

function getHeaders() {
  const key = process.env.REBRICKABLE_API_KEY;
  if (!key) throw new Error("REBRICKABLE_API_KEY is not set");
  return { Authorization: `key ${key}` };
}

export interface RebrickableSet {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string | null;
  set_url: string;
}

export interface RebrickablePart {
  id: number;
  inv_part_id: number;
  part: {
    part_num: string;
    name: string;
    part_img_url: string | null;
  };
  color: {
    id: number;
    name: string;
  };
  quantity: number;
  is_spare: boolean;
}

export async function fetchSet(setNum: string): Promise<RebrickableSet> {
  const normalized = setNum.includes("-") ? setNum : `${setNum}-1`;
  const res = await fetch(`${REBRICKABLE_BASE}/sets/${normalized}/`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Set ${setNum} not found on Rebrickable (${res.status})`);
  }
  return res.json();
}

export async function fetchSetParts(
  setNum: string,
  page = 1,
  pageSize = 1000
): Promise<{ results: RebrickablePart[]; next: string | null }> {
  const normalized = setNum.includes("-") ? setNum : `${setNum}-1`;
  const res = await fetch(
    `${REBRICKABLE_BASE}/sets/${normalized}/parts/?page=${page}&page_size=${pageSize}&inc_part_details=1`,
    { headers: getHeaders() }
  );
  if (!res.ok) {
    throw new Error(`Parts for ${setNum} not found (${res.status})`);
  }
  return res.json();
}

export async function fetchThemeName(themeId: number): Promise<string> {
  try {
    const res = await fetch(`${REBRICKABLE_BASE}/themes/${themeId}/`, {
      headers: getHeaders(),
    });
    if (!res.ok) return "Unknown";
    const data = await res.json();
    return data.name ?? "Unknown";
  } catch {
    return "Unknown";
  }
}

export interface RebrickableMinifig {
  id: number;
  set_num: string;    // figNum, e.g. "fig-010913"
  set_name: string;   // display name
  quantity: number;
  set_img_url: string | null;
}

export async function fetchSetMinifigs(
  setNum: string
): Promise<RebrickableMinifig[]> {
  const normalized = setNum.includes("-") ? setNum : `${setNum}-1`;
  const res = await fetch(
    `${REBRICKABLE_BASE}/sets/${normalized}/minifigs/?page_size=100`,
    { headers: getHeaders() }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}
