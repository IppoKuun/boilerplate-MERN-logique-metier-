"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth"; // <-- ton service d’auth

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.login({ username, password });
      router.replace("/admin");
    } catch (err) {
      setError(err?.msg || err?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-3 border rounded-2xl p-6 shadow"
      >
        <h1 className="text-xl font-semibold">Connexion</h1>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nom d’utilisateur"
          autoComplete="username"
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoComplete="current-password"
          className="w-full border rounded-lg px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          className="w-full border rounded-lg py-2"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
