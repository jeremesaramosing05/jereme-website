"use client";

import { useState } from "react";

export function ChessDownloadGate() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chess-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Incorrect password.");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      // Navigate to the short-lived signed URL to start the download.
      window.location.href = url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Access code"
        autoComplete="off"
        className="w-full rounded-full border border-line bg-background px-5 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent sm:w-56"
      />
      <button
        type="submit"
        disabled={loading || !password}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm tracking-wide text-background transition-all duration-300 hover:bg-accent-strong hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {loading ? "Checking…" : "Unlock download"}
      </button>
      {error && (
        <p className="text-sm text-red-500 sm:ml-2" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
