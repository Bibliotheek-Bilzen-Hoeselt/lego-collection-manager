"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, AlertCircle } from "lucide-react";
import Image from "next/image";

interface PreviewSet {
  setNum: string;
  name: string;
  year: number;
  theme: string;
  numParts: number;
  imgUrl: string | null;
}

export default function AddSetPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<PreviewSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      // We preview via POST but read-only — use Rebrickable directly via our API proxy
      const res = await fetch(`/api/rebrickable/preview?setNum=${encodeURIComponent(input.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Set niet gevonden");
      }
      setPreview(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setNum: preview.setNum }),
      });
      const data = await res.json();
      if (res.ok || (res.status === 409 && data.slug)) {
        router.push(`/sets/${data.slug}`);
      } else {
        throw new Error(data.error ?? "Toevoegen mislukt");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
      setAdding(false);
    }
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Set toevoegen</h1>
        <p className="text-gray-500 text-sm mt-1">Voer een LEGO setnummer in (bijv. 75192 of 10497-1)</p>
      </header>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Setnummer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[64px]"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          className="bg-yellow-400 text-yellow-900 font-bold px-6 rounded-2xl min-h-[64px] min-w-[64px] flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-6 h-6 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {preview.imgUrl && (
            <div className="relative h-52 bg-gray-50">
              <Image src={preview.imgUrl} alt={preview.name} fill className="object-contain p-4" />
            </div>
          )}
          <div className="p-5">
            <p className="text-xs text-gray-400 font-mono">{preview.setNum}</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{preview.name}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span>📅 {preview.year}</span>
              <span>🎨 {preview.theme}</span>
              <span>🧩 {preview.numParts} onderdelen</span>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="mt-5 w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-3 min-h-[64px] active:scale-95 disabled:opacity-60"
            >
              {adding ? (
                <>
                  <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Bezig met toevoegen...
                </>
              ) : (
                <>
                  <PlusCircle className="w-6 h-6" />
                  Toevoegen aan collectie
                </>
              )}
            </button>
            {adding && (
              <p className="text-sm text-gray-500 text-center mt-3">
                Onderdelen worden opgehaald van Rebrickable. Dit kan even duren...
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
