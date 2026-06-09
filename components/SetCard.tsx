"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Trash2, AlertTriangle, Package } from "lucide-react";

interface SetCardProps {
  id: string;
  slug: string;
  setNum: string;
  name: string;
  year?: number | null;
  theme?: string | null;
  imgUrl?: string | null;
  totalParts: number;
  missingParts: number;
  onDelete: (id: string) => void;
}

export default function SetCard({
  id,
  slug,
  setNum,
  name,
  year,
  theme,
  imgUrl,
  totalParts,
  missingParts,
  onDelete,
}: SetCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Set "${name}" verwijderen uit je collectie?`)) return;
    setDeleting(true);
    await fetch(`/api/sets/${slug}`, { method: "DELETE" });
    onDelete(id);
  };

  const hasMissing = missingParts > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <Link href={`/sets/${slug}`} className="block">
        <div className="relative h-40 bg-gray-50 flex items-center justify-center">
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <Package className="w-16 h-16 text-gray-300" />
          )}
          {hasMissing && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {missingParts} vermist
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 font-mono">{setNum}</p>
          <h3 className="font-bold text-gray-900 text-base leading-snug mt-0.5 line-clamp-2">{name}</h3>
          <div className="flex gap-3 mt-2 text-sm text-gray-500">
            {year && <span>{year}</span>}
            {theme && <span className="truncate">{theme}</span>}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${hasMissing ? "bg-red-400" : "bg-green-400"}`}
                style={{ width: totalParts > 0 ? `${((totalParts - missingParts) / totalParts) * 100}%` : "100%" }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {totalParts - missingParts}/{totalParts}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium flex items-center justify-center gap-2 active:bg-red-50 min-h-[48px]"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Verwijderen..." : "Verwijder set"}
        </button>
      </div>
    </div>
  );
}
