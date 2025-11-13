"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import api from "@/app/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/login", { username, password })
      router.replace("/admin/adminAcceuil")
    } catch (e) {
      setError(e?.message || e?.msg || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <form
        onSubmit={onSubmit}
        className="card w-full max-w-sm p-6 space-y-4 shadow-md"
      >
        <h1 className="text-2xl font-semibold text-center text-brand-600">
          Connexion NodeShop
        </h1>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input text-white"
          placeholder="Nom d'utilisateur"
          autoComplete="username"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input text-white"
          placeholder="Mot de passe"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="btn-primary w-full"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {error && (
          <p className="text-center text-sm text-red-500 animate-glow">
            {error}
          </p>
        )}
      </form>
    </main>
  )
}
