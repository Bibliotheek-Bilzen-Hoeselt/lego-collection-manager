"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle, XCircle, User } from "lucide-react";

type Status = "PRESENT" | "MISSING";

interface MinifigRowProps {
  setMinifigId: string;
  figNum: string;
  name: string;
  numParts?: number | null;
  imgUrl?: string | null;
  quantity: number;
  status: Status;
  onStatusChange?: (setMinifigId: string, status: Status) => void;
}

export default function MinifigRow({
  setMinifigId,
  figNum,
  name,
  numParts,
  imgUrl,
  quantity,
  status: initialStatus,
  onStatusChange,
}: MinifigRowProps) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (saving) return;
    const next: Status = status === "PRESENT" ? "MISSING" : "PRESENT";
    setStatus(next);
    setSaving(true);
    await fetch(`/api/minifig-inventory/${setMinifigId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    onStatusChange?.(setMinifigId, next);
  };

  const present = status === "PRESENT";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
      ${present ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}`}>

      {/* Image */}
      <div className="w-14 h-14 flex-shrink-0 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
        {imgUrl ? (
          <Image src={imgUrl} alt={name} width={56} height={56} className="object-contain" />
        ) : (
          <User className="w-8 h-8 text-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{name}</p>
        <p className="text-xs text-gray-500 mt-0.5">#{figNum}</p>
        <div className="flex gap-3 mt-1 text-xs text-gray-500">
          {quantity > 1 && <span>×{quantity}</span>}
          {numParts && <span>{numParts} onderdelen</span>}
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        disabled={saving}
        aria-label={`${name}: ${present ? "Aanwezig" : "Vermist"}. Tik om te wijzigen.`}
        className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-2 min-w-[80px] min-h-[64px] font-semibold text-xs transition-all active:scale-95
          ${present ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"}
          ${saving ? "opacity-50" : "cursor-pointer"}`}
      >
        {present
          ? <CheckCircle className="w-7 h-7" />
          : <XCircle className="w-7 h-7" />}
        {saving ? "..." : present ? "Aanwezig" : "Vermist"}
      </button>
    </div>
  );
}
