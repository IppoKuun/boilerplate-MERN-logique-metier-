import { notFound } from "next/navigation";

export const revalidate = 60;

async function getProductBySlug(slug) {
    const res = await fetch(`http://localhost:4000/backend/products/${products.slug}`)
    if (res.status === 404) {
        return notFound()
    }

    if (!res.ok) {
        throw new Error(`Erreur connexion backend: ERR ${res.status}`)
    }

    const data = await res.json()
    return data || res.data || res.data.data
}

function formatPrice(price, currency = 'EUR', locale = 'fr-FR') {
  // Petit helper : affichage propre des prix (ex: 19,90 €)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price ?? 0);
  } catch {
    return `${price ?? 0} ${currency}`;
  }
}

export default function ProductPage({params}) {
    const {slug} = params

    const product = getProductBySlug(slug)

    const {
        nom= "",
        images= [],
        category= "",
        price= 0,
        shortDesc= "",
        description= "" } = product = {};

        return (
            <div>

            </div>
        )

    }