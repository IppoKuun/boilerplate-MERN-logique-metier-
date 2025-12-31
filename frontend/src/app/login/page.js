"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import api from "@/app/lib/api"

const demoAccounts = [
  { label: "demo1 (viewer)", username: "demo1", password: "MdPdemo1!" },
  { label: "demo2 (viewer)", username: "demo2", password: "MdPdemo2!" },
]

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

  const fillDemo = (u, p) => {
    setUsername(u)
    setPassword(p)
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

        <div className="card bg-slate-50 p-3 dark:bg-slate-900/40">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Comptes viewer (lecture seule) pour tester le backoffice :
          </p>
          <ul className="mt-1 text-sm text-slate-700 dark:text-slate-200 space-y-1">
            {demoAccounts.map((acc) => (
              <li key={acc.username}>
                username : <strong>{acc.username}</strong> — mot de passe : <strong>{acc.password}</strong>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                type="button"
                className="btn border border-slate-300 dark:border-slate-700 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => fillDemo(acc.username, acc.password)}
              >
                Remplir {acc.username}
              </button>
            ))}
          </div>
        </div>

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
