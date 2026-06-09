"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, CheckCircle, XCircle, MinusCircle, Package, User } from "lucide-react";
import PartCard from "@/components/PartCard";
import MinifigRow from "@/components/MinifigRow";

type Status = "PRESENT" | "MISSING" | "PARTIAL";
type MinifigStatus = "PRESENT" | "MISSING";

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

interface Minifig {
  setMinifigId: string;
  figNum: string;
  name: string;
  numParts: number | null;
  imgUrl: string | null;
  quantity: number;
  status: MinifigStatus;
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
  minifigs: Minifig[];
}

type Filter = "ALL" | "PRESENT" | "MISSING" | "PARTIAL";
type View = "parts" | "minifigs";

export default function SetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [set, setSet] = useState<SetDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("parts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sets/${slug}/parts`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        if (!r.ok) { router.push("/"); return null; }
        return r.json();
      })
      .then((data) => { if (data) { setSet(data); setLoading(false); } });
  }, [slug, router]);

  const handlePartStatusChange = useCallback((setPartId: string, status: Status, quantityOwned: number) => {
    setSet((prev) => prev ? {
      ...prev,
      parts: prev.parts.map((p) => p.setPartId === setPartId ? { ...p, status, quantityOwned } : p),
    } : prev);
  }, []);

  const handleMinifigStatusChange = useCallback((setMinifigId: string, status: MinifigStatus) => {
    setSet((prev) => prev ? {
      ...prev,
      minifigs: prev.minifigs.map((m) => m.setMinifigId === setMinifigId ? { ...m, status } : m),
    } : prev);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Package className="w-20 h-20 text-gray-200 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Set niet gevonden</h1>
        <p className="text-gray-500 mb-8">Deze set bestaat niet of werd verwijderd uit de collectie.</p>
        <Link
          href="/"
          className="bg-yellow-400 text-yellow-900 font-bold py-4 px-8 rounded-2xl text-base min-h-[56px] flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Terug naar collectie
        </Link>
      </div>
    );
  }

  if (!set) return null;

  // Count pieces (quantity), not types
  const totalPieces = set.parts.reduce((acc, p) => acc + p.quantity, 0);
  const presentPieces = set.parts.reduce((acc, p) => acc + (p.status === "PRESENT" ? p.quantity : p.quantityOwned), 0);
  const missingPieces = set.parts.reduce((acc, p) => {
    if (p.status === "MISSING") return acc + p.quantity;
    if (p.status === "PARTIAL") return acc + (p.quantity - p.quantityOwned);
    return acc;
  }, 0);
  const partialPieces = set.parts.reduce((acc, p) => {
    if (p.status === "PARTIAL") return acc + (p.quantity - p.quantityOwned);
    return acc;
  }, 0);
  // Type counts (for filter buttons)
  const present = set.parts.filter((p) => p.status === "PRESENT").length;
  const missing = set.parts.filter((p) => p.status === "MISSING").length;
  const partial = set.parts.filter((p) => p.status === "PARTIAL").length;
  const missingMinifigs = set.minifigs.filter((m) => m.status === "MISSING").length;
  const hasMissing = missingPieces + missingMinifigs > 0;

  const filteredParts = set.parts.filter((p) => {
    const matchFilter =
      filter === "ALL" ||
      p.status === filter ||
      (filter === "MISSING" && p.status === "PARTIAL");
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNum.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredMinifigs = set.minifigs.filter((m) => {
    const matchFilter = filter === "ALL" || m.status === filter;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filterBtns: { key: Filter; label: string; count: number; icon: typeof CheckCircle; color: string }[] = [
    { key: "ALL", label: "Alle", count: view === "parts" ? set.parts.length : set.minifigs.length, icon: Package, color: "bg-gray-100 text-gray-700" },
    { key: "PRESENT", label: "Aanwezig", count: view === "parts" ? present : set.minifigs.filter(m => m.status === "PRESENT").length, icon: CheckCircle, color: "bg-green-100 text-green-700" },
    ...(view === "parts" ? [{ key: "PARTIAL" as Filter, label: "Gedeeltelijk", count: partial, icon: MinusCircle, color: "bg-orange-100 text-orange-700" }] : []),
    { key: "MISSING", label: "Vermist", count: view === "parts" ? missingPieces : missingMinifigs, icon: XCircle, color: "bg-red-100 text-red-700" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/" className="p-3 rounded-2xl bg-white border border-gray-200 min-w-[48px] min-h-[48px] flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-mono">{set.setNum}</p>
          <h1 className="font-bold text-gray-900 text-lg leading-snug truncate">{set.name}</h1>
        </div>
      </div>

      {/* Set info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5 flex flex-col sm:flex-row">
        {set.imgUrl && (
          <div className="relative h-44 sm:w-56 sm:h-auto bg-gray-50 flex-shrink-0">
            <Image src={set.imgUrl} alt={set.name} fill className="object-contain p-3" />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex gap-4 text-sm text-gray-600 flex-wrap mb-4">
            {set.year && <span>📅 {set.year}</span>}
            {set.theme && <span>🎨 {set.theme}</span>}
            <span>🧩 {set.numParts} onderdelen</span>
            {set.minifigs.length > 0 && <span>👤 {set.minifigs.length} minifigs</span>}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{presentPieces} stuks aanwezig</span>
            <span>{missingPieces} stuks vermist</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-400 h-full transition-all duration-300" style={{ width: `${(presentPieces / totalPieces) * 100}%` }} />
            <div className="bg-orange-300 h-full transition-all duration-300" style={{ width: `${(partialPieces / totalPieces) * 100}%` }} />
          </div>
          {hasMissing && (
            <a
              href={`/api/export?setId=${set.id}`}
              className="mt-4 inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-bold py-3 px-5 rounded-xl text-sm min-h-[48px] active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export vermiste onderdelen (CSV)
            </a>
          )}
        </div>
      </div>

      {/* View switcher */}
      {set.minifigs.length > 0 && (
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-2xl">
          <button onClick={() => { setView("parts"); setFilter("ALL"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-all ${view === "parts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            <Package className="w-4 h-4" />
            Onderdelen ({set.parts.length})
          </button>
          <button onClick={() => { setView("minifigs"); setFilter("ALL"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-all ${view === "minifigs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            <User className="w-4 h-4" />
            Minifigs ({set.minifigs.length})
            {missingMinifigs > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{missingMinifigs}</span>
            )}
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="overflow-x-auto mb-4 -mx-4">
        <div className="flex gap-2 px-4 py-1 w-max min-w-full">
        {filterBtns.map(({ key, label, count, icon: Icon, color }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap min-h-[48px] transition-all flex-shrink-0
              ${filter === key ? color + " ring-2 ring-offset-1 ring-current" : "bg-white text-gray-500 border border-gray-200"}`}>
            <Icon className="w-4 h-4" />
            {label} ({count})
          </button>
        ))}
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder={view === "parts" ? "Onderdeel zoeken..." : "Minifig zoeken..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[52px]"
      />

      {/* Parts grid */}
      {view === "parts" ? (
        filteredParts.length === 0
          ? <p className="text-center text-gray-400 py-10">Geen onderdelen gevonden</p>
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredParts.map((part) => (
                <PartCard key={part.setPartId} {...part} onStatusChange={handlePartStatusChange} />
              ))}
            </div>
          )
      ) : (
        filteredMinifigs.length === 0
          ? <p className="text-center text-gray-400 py-10">Geen minifigs gevonden</p>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredMinifigs.map((fig) => (
                <MinifigRow key={fig.setMinifigId} {...fig} onStatusChange={handleMinifigStatusChange} />
              ))}
            </div>
          )
      )}
    </>
  );
}
