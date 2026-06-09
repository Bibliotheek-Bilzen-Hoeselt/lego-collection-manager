"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package } from "lucide-react";
import SetCard from "@/components/SetCard";
import Link from "next/link";

interface SetSummary {
  id: string;
  setNum: string;
  name: string;
  year: number | null;
  theme: string | null;
  imgUrl: string | null;
  totalParts: number;
  missingParts: number;
}

export default function HomePage() {
  const [sets, setSets] = useState<SetSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sets")
      .then((r) => r.json())
      .then((data) => { setSets(data); setLoading(false); });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const filtered = sets.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.setNum.toLowerCase().includes(query.toLowerCase()) ||
      (s.theme?.toLowerCase().includes(query.toLowerCase()) ?? false)
  );

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🧱 Mijn LEGO-collectie</h1>
        <p className="text-gray-500 text-sm mt-1">{sets.length} sets</p>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          placeholder="Zoek op naam, setnummer of thema..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[56px]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">
            {sets.length === 0 ? "Nog geen sets toegevoegd" : "Geen sets gevonden"}
          </p>
          {sets.length === 0 && (
            <Link
              href="/add"
              className="mt-6 bg-yellow-400 text-yellow-900 font-bold py-4 px-8 rounded-2xl text-base min-h-[56px] flex items-center"
            >
              Eerste set toevoegen
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((set) => (
            <SetCard key={set.id} {...set} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </>
  );
}
