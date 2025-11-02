"use clients";

import { useEffect, useState } from "react"
import {} from "remixicon-react"
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { NavLink } from "react-router-dom";


export default function NavBar(){

const [open, setOpen] = useState(false)
const pathname = usePathname()

const navLinkClass = (href) => {
    pathname === href ? "" : ""
}

return (
    <header className="">
        <nav className="">
            <Image 
            src="/logo.png"
            alt="Logo app"
            width={40}
            height={40}
            className=""
            href="/"
            />
            <div className="">
                <Link href="/" className="">Acceuil</Link>
                <Link href="Produit" className="">Produit</Link>
                <Link href="Logs" className="">Logs</Link>
                <Link href="Audit" className="">Audits</Link>
                <Link href="Ajoutez" className="">Ajoutez</Link>
            </div>
            <Link href="/" className={navLinkClass("/")}>Accueil</Link>
            <Link href="/Logs" className={navLinkClass("/Logs")}>Produits</Link>
            <Link href="/Audit" className={navLinkClass("/Audit")}>Produits</Link>
            <Link href="/Audit" className={navLinkClass("/Audit")}>Produits</Link>
            <Link href="/Ajoutez" className={navLinkClass("Ajoutez")}>Produits</Link>

            <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Ouvrir le menu"
            className=""
            ></button>

            {open && (
                <div className="">
                    <Link href="/" className="">Acceuil</Link>
                    <Link href="Produit" className="">Produit</Link>
                    <Link href="Logs" className="">Logs</Link>
                    <Link href="Audit" className="">Audits</Link>
                    <Link href="Ajoutez" className="">Ajoutez</Link>
                                <Link href="/" className={navLinkClass("/")}>Accueil</Link>
                            <Link href="/Logs" className={navLinkClass("/Logs")}>Produits</Link>
                            <Link href="/Audit" className={navLinkClass("/Audit")}>Produits</Link>
                            <Link href="/Audit" className={navLinkClass("/Audit")}>Produits</Link>
                            <Link href="/Ajoutez" className={navLinkClass("Ajoutez")}>Produits</Link>
                </div>
            )}
        </nav>
    </header>
)
}