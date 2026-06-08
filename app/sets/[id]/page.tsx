"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, CheckCircle, XCircle, MinusCircle, Package } from "lucide-react";
import PartRow from "@/components/PartRow";

type Status = "PRESENT" | "MISSING" | "PARTIAL";

interface Part {
  setPartId: string;
  partNum: string;
  name: string;
  color: string;
  imgUrl: string | null;
  quantity: number;
  quantityOwned: number;
  status: Status;
  inventoryId: string | null;
}

interface SetDetail {
  id: string;
  setNum: string;
  name: string;
  year: number | null;
  theme: string | null;
  imgUrl: string | null;
  numParts: number | null;
  parts: Part[];
}

type Filter = "ALL" | "PRESENT" | "MISSING" | "PARTIAL";

export default function SetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [set, setSet] = useState<SetDetail | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sets/${id}/parts`)
      .then((r) => {
        if (!r.ok) { router.push("/"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setSet(data); setLoading(false); });
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!set) return null;

  const filteredParts = set.parts.filter((p) => {
    const matchFilter = filter === "ALL" || p.status === filter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNum.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const present = set.parts.filter((p) => p.status === "PRESENT").length;
  const missing = set.parts.filter((p) => p.status === "MISSING").length;
  const partial = set.parts.filter((p) => p.status === "PARTIAL").length;
  const hasMissing = missing + partial > 0;

  const filterBtns: { key: Filter; label: string; count: number; icon: typeof CheckCircle; color: string }[] = [
    { key: "ALL", label: "Alle", count: set.parts.length, icon: Package, color: "bg-gray-100 text-gray-700" },
    { key: "PRESENT", label: "Aanwezig", count: present, icon: CheckCircle, color: "bg-green-100 text-green-700" },
    { key: "PARTIAL", label: "Gedeeltelijk", count: partial, icon: MinusCircle, color: "bg-orange-100 text-orange-700" },
    { key: "MISSING", label: "Vermist", count: missing, icon: XCircle, color: "bg-red-100 text-red-700" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/" className="p-3 rounded-2xl bg-white border border-gray-200 min-w-[48px] min-h-[48px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-mono">{set.setNum}</p>
          <h1 className="font-bold text-gray-900 text-lg leading-snug truncate">{set.name}</h1>
        </div>
      </div>

      {/* Set image + stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {set.imgUrl && (
          <div className="relative h-44 bg-gray-50">
            <Image src={set.imgUrl} alt={set.name} fill className="object-contain p-3" />
          </div>
        )}
        <div className="p-4 flex gap-4 text-sm text-gray-600 flex-wrap">
          {set.year && <span>📅 {set.year}</span>}
          {set.theme && <span>🎨 {set.theme}</span>}
          <span>🧩 {set.numParts} onderdelen</span>
        </div>
        {/* Progress bar */}
        <div className="px-4 pb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{present} aanwezig</span>
            <span>{missing + partial} vermist/gedeeltelijk</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-400 h-full transition-all" style={{ width: `${(present / set.parts.length) * 100}%` }} />
            <div className="bg-orange-300 h-full transition-all" style={{ width: `${(partial / set.parts.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Export button */}
      {hasMissing && (
        <a
          href={`/api/export?setId=${set.id}`}
          className="flex items-center justify-center gap-2 w-full py-4 mb-5 bg-yellow-400 text-yellow-900 font-bold rounded-2xl text-base min-h-[56px] active:scale-95"
        >
          <Download className="w-5 h-5" />
          Export vermiste onderdelen (CSV)
        </a>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {filterBtns.map(({ key, label, count, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap min-h-[48px] transition-all flex-shrink-0
              ${filter === key ? color + " ring-2 ring-offset-1 ring-current" : "bg-white text-gray-500 border border-gray-200"}`}
          >
            <Icon className="w-4 h-4" />
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Onderdeel zoeken..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[52px]"
      />

      {/* Parts list */}
      <div className="space-y-2">
        {filteredParts.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Geen onderdelen gevonden</p>
        ) : (
          filteredParts.map((part) => <PartRow key={part.setPartId} {...part} />)
        )}
      </div>
    </>
  );
}
