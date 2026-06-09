"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";

type Status = "PRESENT" | "MISSING" | "PARTIAL";

interface PartRowProps {
  setPartId: string;
  inventoryId: string | null;
  partNum: string;
  name: string;
  color: string;
  imgUrl?: string | null;
  quantity: number;
  quantityOwned: number;
  status: Status;
  onStatusChange?: (setPartId: string, status: Status, quantityOwned: number) => void;
}

const statusConfig: Record<Status, { label: string; icon: typeof CheckCircle; classes: string; bg: string }> = {
  PRESENT: {
    label: "Aanwezig",
    icon: CheckCircle,
    classes: "text-green-700 border-green-300 bg-green-50",
    bg: "bg-green-500",
  },
  MISSING: {
    label: "Vermist",
    icon: XCircle,
    classes: "text-red-700 border-red-300 bg-red-50",
    bg: "bg-red-500",
  },
  PARTIAL: {
    label: "Gedeeltelijk",
    icon: MinusCircle,
    classes: "text-orange-700 border-orange-300 bg-orange-50",
    bg: "bg-orange-400",
  },
};

export default function PartRow({
  setPartId,
  inventoryId,
  partNum,
  name,
  color,
  imgUrl,
  quantity,
  quantityOwned: initialOwned,
  status: initialStatus,
  onStatusChange,
}: PartRowProps) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [quantityOwned, setQuantityOwned] = useState(initialOwned);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = async (newStatus: Status, newQty: number) => {
    if (!inventoryId) return;
    setSaving(true);
    await fetch(`/api/inventory/${inventoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, quantityOwned: newQty }),
    });
    setSaving(false);
    onStatusChange?.(setPartId, newStatus, newQty);
  };

  const cycleStatus = () => {
    if (!inventoryId || saving) return;
    const order: Status[] = ["PRESENT", "PARTIAL", "MISSING"];
    const next = order[(order.indexOf(status) + 1) % order.length];
    const nextOwned =
      next === "PRESENT" ? quantity :
      next === "MISSING" ? 0 :
      Math.min(quantityOwned === 0 ? quantity - 1 : quantityOwned, quantity - 1);
    setStatus(next);
    setQuantityOwned(nextOwned);
    save(next, nextOwned);
  };

  const handleQtyChange = (val: number) => {
    const clamped = Math.max(0, Math.min(quantity, val));
    const newStatus: Status =
      clamped === 0 ? "MISSING" :
      clamped >= quantity ? "PRESENT" :
      "PARTIAL";
    setQuantityOwned(clamped);
    setStatus(newStatus);
    // Debounce saves while typing
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(newStatus, clamped), 600);
  };

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.classes} transition-colors`}>
      {/* Part image */}
      <div className="w-14 h-14 flex-shrink-0 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
        {imgUrl ? (
          <Image src={imgUrl} alt={name} width={56} height={56} className="object-contain" />
        ) : (
          <div className={`w-8 h-8 rounded ${cfg.bg} opacity-30`} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {color} · #{partNum}
        </p>

        {/* Quantity input — only visible when PARTIAL */}
        {status === "PARTIAL" ? (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-600">Aanwezig:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQtyChange(quantityOwned - 1)}
                className="w-8 h-8 rounded-lg bg-orange-200 text-orange-800 font-bold text-lg flex items-center justify-center active:scale-90"
                aria-label="Minder"
              >−</button>
              <span className="text-sm font-bold text-orange-800 min-w-[2.5rem] text-center">
                {quantityOwned}/{quantity}
              </span>
              <button
                onClick={() => handleQtyChange(quantityOwned + 1)}
                className="w-8 h-8 rounded-lg bg-orange-200 text-orange-800 font-bold text-lg flex items-center justify-center active:scale-90"
                aria-label="Meer"
              >+</button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-600 mt-1">
            {quantityOwned}/{quantity} stuks
          </p>
        )}
      </div>

      {/* Status toggle button */}
      <button
        onClick={cycleStatus}
        disabled={saving || !inventoryId}
        aria-label={`Status: ${cfg.label}. Tik om te wijzigen.`}
        className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-2 min-w-[80px] min-h-[64px] font-semibold text-xs transition-all active:scale-95 ${cfg.classes} ${saving ? "opacity-50" : "cursor-pointer"}`}
      >
        <Icon className="w-7 h-7" />
        {saving ? "..." : cfg.label}
      </button>
    </div>
  );
}
