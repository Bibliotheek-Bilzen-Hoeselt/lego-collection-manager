"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, AlertTriangle, PlusCircle } from "lucide-react";

const nav = [
  { href: "/", label: "Collectie", icon: Home },
  { href: "/missing", label: "Vermist", icon: AlertTriangle },
  { href: "/add", label: "Toevoegen", icon: PlusCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-3 min-h-[64px] text-sm font-medium transition-colors
                ${active ? "text-yellow-600" : "text-gray-500 hover:text-yellow-500"}`}
            >
              <Icon className="w-7 h-7 mb-1" strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
