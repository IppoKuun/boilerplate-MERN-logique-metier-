"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { auth } from "../lib/authApi"

export default function loginPage(){
    const router = useRouter()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const  [err, setError] = useState("")

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
}