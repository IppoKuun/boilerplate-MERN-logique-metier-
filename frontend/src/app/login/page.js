"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth } from "../lib/authApi"

export default function LoginPage(){
    const router = useRouter()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const  [error, setError] = useState("")

    async function onSubmit(e){
        e.preventDefault()
        setError("")
        setLoading(true)

        try{
            await auth.login({username, password})
            router.replace("/admin")
        } catch(e){
            setError(e?.message || e?.msg || "erreur de connexion")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="">
            <form
            onSubmit={onSubmit}
            className="">
                <h1 className="">Connectez-vous !</h1>
                <input
                type="text"
                value={username}
                onChange={((e) => setUsername(e.target.value) )}
                className=""
                autoComplete="username"
                placeholder="Entrez votre nom d'utilisateur"
                ></input>

                <input
                type="password"
                value={password}
                onChange={((e) => setPassword(e.target.value) )}
                className=""
                autoComplete="password"
                placeholder="Entrez votre mots de passe"
                ></input>
                
                <button 
                disabled={loading || !username || !password }
                className="">
                {loading ? "Connexion...": "Se connecter"}
                </button>
            </form>

            {error && <p className="">{error}</p>}

        </main>
    )
}