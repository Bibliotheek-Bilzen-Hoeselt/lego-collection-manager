"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";

type Status = "PRESENT" | "MISSING" | "PARTIAL";

interface PartCardProps {
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

const statusConfig: Record<Status, { label: string; icon: typeof CheckCircle; border: string; bg: string; text: string; btnBg: string }> = {
  PRESENT: {
    label: "Aanwezig",
    icon: CheckCircle,
    border: "border-green-300",
    bg: "bg-green-50",
    text: "text-green-700",
    btnBg: "bg-green-500 hover:bg-green-600",
  },
  MISSING: {
    label: "Vermist",
    icon: XCircle,
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-700",
    btnBg: "bg-red-500 hover:bg-red-600",
  },
  PARTIAL: {
    label: "Gedeeltelijk",
    icon: MinusCircle,
    border: "border-orange-300",
    bg: "bg-orange-50",
    text: "text-orange-700",
    btnBg: "bg-orange-400 hover:bg-orange-500",
  },
};

export default function PartCard({
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
}: PartCardProps) {
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
    const newStatus: Status = clamped === 0 ? "MISSING" : clamped >= quantity ? "PRESENT" : "PARTIAL";
    setQuantityOwned(clamped);
    setStatus(newStatus);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(newStatus, clamped), 600);
  };

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className={`flex flex-col rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-colors`}>
      {/* Image area */}
      <div className="relative bg-white flex items-center justify-center h-28">
        {imgUrl ? (
          <Image src={imgUrl} alt={name} fill className="object-contain p-2" sizes="200px" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100" />
        )}
        {quantity > 1 && (
          <span className="absolute top-1.5 right-1.5 bg-gray-800 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            ×{quantity}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-2 pt-2 pb-1 flex-1">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{color}</p>
      </div>

      {/* Quantity row when partial */}
      {status === "PARTIAL" && (
        <div className="flex items-center justify-center gap-1 px-2 pb-1">
          <button onClick={() => handleQtyChange(quantityOwned - 1)}
            className="w-7 h-7 rounded-lg bg-orange-200 text-orange-800 font-bold flex items-center justify-center active:scale-90 text-base">−</button>
          <span className="text-xs font-bold text-orange-800 min-w-[2rem] text-center">{quantityOwned}/{quantity}</span>
          <button onClick={() => handleQtyChange(quantityOwned + 1)}
            className="w-7 h-7 rounded-lg bg-orange-200 text-orange-800 font-bold flex items-center justify-center active:scale-90 text-base">+</button>
        </div>
      )}

      {/* Status toggle button */}
      <button
        onClick={cycleStatus}
        disabled={saving || !inventoryId}
        className={`w-full flex items-center justify-center gap-1.5 py-2.5 min-h-[48px] font-semibold text-xs text-white transition-all active:scale-95 ${cfg.btnBg} ${saving ? "opacity-50" : ""}`}
      >
        <Icon className="w-4 h-4" />
        {saving ? "..." : cfg.label}
      </button>
    </div>
  );
}
