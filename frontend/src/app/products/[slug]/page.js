// src/app/products/[slug]/page.js
import { notFound } from "next/navigation";
import Image from "next/image"; // utile si tu gardes des images statiques (logo, etc.)
import GalleryClient from "@/app/products/[slug]/galerryClients.js"; 
export const revalidate = 60;

/** Récupération d'un produit par slug (SSR/SSG avec revalidate) */
async function getProductBySlug(slug) {
  const res = await fetch(
    `http://localhost:4000/products/slug/${encodeURIComponent(slug)}`,
    { next: { revalidate: 60 } }
  );

  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error(`Erreur backend: ${res.status}`);

  const data = await res.json();
  // tolère différents enveloppages de réponse
  return data?.data ?? data;
}

/** Affichage localisé du prix */
function formatPrice(price, currency = "EUR", locale = "fr-FR") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(price ?? 0);
  } catch {
    return `${price ?? 0} ${currency}`;
  }
}

/** Normalisation des images vers string[] (URL) */
function toUrls(images) {
  if (!images) return [];
  return images
    .map((x) => {
      if (typeof x === "string") return x;
      return x?.url || x?.secure_url || null;
    })
    .filter(Boolean);
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const {
    name = "",
    images = [],
    category = "",
    price = 0,
    shortDesc = "",
    description = "",
  } = product || {};

  const imageUrls = toUrls(images); // <- prêt pour la galerie

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      {/* En-tête produit */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galerie */}
        <div>
          <GalleryClient images={imageUrls} alt={name || "Produit"} />
        </div>

        {/* Infos produit */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold">{name}</h1>
          {category && <div className="text-sm text-gray-500">{category}</div>}
          <div className="text-xl font-bold">{formatPrice(price)}</div>
          {shortDesc && <p className="text-gray-700">{shortDesc}</p>}

          <button
            type="button"
            className="rounded-lg bg-black text-white px-4 py-2 hover:bg-gray-900"
            aria-label="Ajouter au panier"
          >
            Ajouter au panier
          </button>
        </div>
      </section>

      {/* Description */}
      {description && (
        <section className="mt-10 prose prose-sm md:prose">
          <h2>Description</h2>
          <p>{description}</p>
        </section>
      )}

      {/* Produits similaires (optionnel) */}
      {/* À brancher: fetch côté serveur, puis mapper ici. */}
    </main>
  );
}
