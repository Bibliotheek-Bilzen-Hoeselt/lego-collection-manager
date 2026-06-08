"use client";

import { useEffect, useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MissingPart {
  setId: string;
  setNum: string;
  setName: string;
  setImgUrl: string | null;
  partNum: string;
  partName: string;
  color: string;
  partImgUrl: string | null;
  quantity: number;
  quantityOwned: number;
  status: "MISSING" | "PARTIAL";
}

interface GroupedSet {
  setId: string;
  setNum: string;
  setName: string;
  setImgUrl: string | null;
  parts: MissingPart[];
}

export default function MissingPage() {
  const [groups, setGroups] = useState<GroupedSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all sets with their parts
    fetch("/api/sets")
      .then((r) => r.json())
      .then(async (sets: { id: string; setNum: string; name: string; imgUrl: string | null; missingParts: number }[]) => {
        const withMissing = sets.filter((s) => s.missingParts > 0);
        const results = await Promise.all(
          withMissing.map(async (s) => {
            const r = await fetch(`/api/sets/${s.id}/parts`);
            const data = await r.json();
            const missing: MissingPart[] = (data.parts ?? [])
              .filter((p: { status: string }) => p.status === "MISSING" || p.status === "PARTIAL")
              .map((p: { partNum: string; name: string; color: string; imgUrl: string | null; quantity: number; quantityOwned: number; status: "MISSING" | "PARTIAL" }) => ({
                setId: s.id,
                setNum: s.setNum,
                setName: s.name,
                setImgUrl: s.imgUrl,
                partNum: p.partNum,
                partName: p.name,
                color: p.color,
                partImgUrl: p.imgUrl,
                quantity: p.quantity,
                quantityOwned: p.quantityOwned,
                status: p.status,
              }));
            return { setId: s.id, setNum: s.setNum, setName: s.name, setImgUrl: s.imgUrl, parts: missing };
          })
        );
        setGroups(results.filter((g) => g.parts.length > 0));
        setLoading(false);
      });
  }, []);

  const totalMissing = groups.reduce((acc, g) => acc + g.parts.length, 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚠️ Vermiste onderdelen</h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? "Laden..." : `${totalMissing} onderdelen in ${groups.length} sets`}
        </p>
      </header>

      {totalMissing > 0 && !loading && (
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
              <Link href={`/sets/${group.setId}`} className="flex items-center gap-3 p-4 border-b border-gray-100 active:bg-gray-50">
                {group.setImgUrl && (
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                    <Image src={group.setImgUrl} alt={group.setName} fill className="object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-mono">{group.setNum}</p>
                  <p className="font-semibold text-gray-900 truncate">{group.setName}</p>
                  <p className="text-sm text-red-500">{group.parts.length} vermist/gedeeltelijk</p>
                </div>
                <a
                  href={`/api/export?setId=${group.setId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 rounded-xl bg-yellow-50 text-yellow-700 min-w-[48px] min-h-[48px] flex items-center justify-center flex-shrink-0"
                  title="Export CSV"
                >
                  <Download className="w-5 h-5" />
                </a>
              </Link>

              {/* Parts */}
              <div className="divide-y divide-gray-50">
                {group.parts.map((p) => (
                  <div key={`${p.setId}-${p.partNum}-${p.color}`} className="flex items-center gap-3 p-3">
                    {p.partImgUrl ? (
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg bg-gray-50 overflow-hidden">
                        <Image src={p.partImgUrl} alt={p.partName} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{p.partName}</p>
                      <p className="text-xs text-gray-500">{p.color} · #{p.partNum}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${p.status === "MISSING" ? "text-red-500" : "text-orange-500"}`}>
                        {p.status === "MISSING" ? "Vermist" : "Gedeeltelijk"}
                      </p>
                      <p className="text-xs text-gray-500">{p.quantityOwned}/{p.quantity}</p>
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
