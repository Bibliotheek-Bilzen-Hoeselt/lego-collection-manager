"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, AlertTriangle, User } from "lucide-react";
import Image from "next/image";

interface MissingItem {
  type: "part" | "minifig";
  key: string;
  partNum: string;
  name: string;
  color?: string;
  imgUrl: string | null;
  quantity: number;
  quantityOwned: number;
  status: "MISSING" | "PARTIAL";
}

interface GroupedSet {
  setId: string;
  setNum: string;
  setSlug: string;
  setName: string;
  setImgUrl: string | null;
  items: MissingItem[];
}

export default function MissingPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupedSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sets")
      .then((r) => r.json())
      .then(async (sets: { id: string; setNum: string; slug: string; name: string; imgUrl: string | null; missingParts: number }[]) => {
        const withMissing = sets.filter((s) => s.missingParts > 0);
        const results = await Promise.all(
          withMissing.map(async (s) => {
            const r = await fetch(`/api/sets/${s.slug}/parts`);
            const data = await r.json();

            const items: MissingItem[] = [
              // Missing parts
              ...(data.parts ?? [])
                .filter((p: { status: string }) => p.status === "MISSING" || p.status === "PARTIAL")
                .map((p: { partNum: string; name: string; color: string; imgUrl: string | null; quantity: number; quantityOwned: number; status: "MISSING" | "PARTIAL" }) => ({
                  type: "part" as const,
                  key: `part-${p.partNum}-${p.color}`,
                  partNum: p.partNum,
                  name: p.name,
                  color: p.color,
                  imgUrl: p.imgUrl,
                  quantity: p.quantity,
                  quantityOwned: p.quantityOwned,
                  status: p.status,
                })),
              // Missing minifigs
              ...(data.minifigs ?? [])
                .filter((m: { status: string }) => m.status === "MISSING")
                .map((m: { figNum: string; name: string; imgUrl: string | null; quantity: number }) => ({
                  type: "minifig" as const,
                  key: `minifig-${m.figNum}`,
                  partNum: m.figNum,
                  name: m.name,
                  imgUrl: m.imgUrl,
                  quantity: m.quantity,
                  quantityOwned: 0,
                  status: "MISSING" as const,
                })),
            ];

            return { setId: s.id, setNum: s.setNum, setSlug: s.slug, setName: s.name, setImgUrl: s.imgUrl, items };
          })
        );
        setGroups(results.filter((g) => g.items.length > 0));
        setLoading(false);
      });
  }, []);

  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚠️ Vermiste onderdelen</h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? "Laden..." : `${totalItems} items in ${groups.length} sets`}
        </p>
      </header>

      {totalItems > 0 && !loading && (
        <a
          href="/api/export"
          className="flex items-center justify-center gap-2 w-full py-4 mb-6 bg-yellow-400 text-yellow-900 font-bold rounded-2xl text-base min-h-[56px] active:scale-95"
        >
          <Download className="w-5 h-5" />
          Export alle vermiste onderdelen (CSV)
        </a>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-gray-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">Geen vermiste onderdelen! 🎉</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.setId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Set header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <button
                  onClick={() => router.push(`/sets/${group.setSlug}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-70"
                >
                  {group.setImgUrl && (
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                      <Image src={group.setImgUrl} alt={group.setName} fill className="object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-mono">{group.setNum}</p>
                    <p className="font-semibold text-gray-900 truncate">{group.setName}</p>
                    <p className="text-sm text-red-500">{group.items.length} vermist</p>
                  </div>
                </button>
                <a
                  href={`/api/export?setId=${group.setId}`}
                  className="p-3 rounded-xl bg-yellow-50 text-yellow-700 min-w-[48px] min-h-[48px] flex items-center justify-center flex-shrink-0"
                  title="Export CSV"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center gap-3 p-3">
                    {/* Image / icon */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
                      {item.imgUrl ? (
                        <div className="relative w-12 h-12">
                          <Image src={item.imgUrl} alt={item.name} fill className="object-contain" />
                        </div>
                      ) : item.type === "minifig" ? (
                        <User className="w-6 h-6 text-gray-400" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.type === "minifig" && (
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded-full">Minifig</span>
                        )}
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.color ? `${item.color} · ` : ""}#{item.partNum}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${item.status === "MISSING" ? "text-red-500" : "text-orange-500"}`}>
                        {item.status === "MISSING" ? "Vermist" : "Gedeeltelijk"}
                      </p>
                      <p className="text-xs text-gray-500">{item.quantity - item.quantityOwned} van {item.quantity} vermist</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
