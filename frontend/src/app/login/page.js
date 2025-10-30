"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth } from "../lib/authApi"

export default function loginPage(){
    const router = useRouter()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const  [error, setError] = useState("")

    async function onSubmit(e){
        e.preventdefault()
        setError("")
        setLoading(true)

        try{
            await auth.login({username, password})
            router.replace("/admin")
        } catch(e){
            setError(err?.message || err?.msg || "erreur de connexion")
        } finally {
            setLoading(true)
        }
    }

    return (
        <main className="">
            <form
            onSubmit={onSubmit}
            className="">
                <h1 className="">Connectez-vous !</h1>
                <input
                value={username}
                onChange={((e) => setUsername(e.target.value) )}
                className=""
                autoComplete="username"
                placeholder="Entrez votre nom d'utilisateur"
                ></input>

                <input
                value={password}
                onChange={((e) => setPassword(e.target.value) )}
                className=""
                autoComplete="password"
                placeholder="Entrez votre mots de passe"
                ></input>
            </form>

            {err && <p className="">{error}</p>}

            <button 
            disabled={loading}
            className=""
            >
            {loading ? "Connexion...": "Se connecter"}
            </button>
        </main>
    )
}