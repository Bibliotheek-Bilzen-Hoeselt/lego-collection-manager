"use client";

import { useState } from "react";
import { Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.replace("/");
    } else {
      setError("Ongeldig wachtwoord. Probeer opnieuw.");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧱</div>
          <h1 className="text-2xl font-bold text-gray-900">LEGO Collectiebeheer</h1>
          <p className="text-gray-500 mt-1 text-sm">Voer het wachtwoord in om verder te gaan</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="relative" suppressHydrationWarning>
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              suppressHydrationWarning
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[60px]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-yellow-400 text-yellow-900 font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-3 min-h-[60px] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Aanmelden
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
