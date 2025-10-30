import { notFound } from "next/navigation";
import { CldImage, CldUploadButton } from 'next-cloudinary';

//AJOUTEZ LES PRODUITS SIMILAIRES ET LA GALERIE. //

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

export default async function ProductPage({params}) {
    const {slug} = params;

    const product = await getProductBySlug(slug);

    const {
        nom= "",
        images= [],
        category= "",
        price= 0,
        shortDesc= "",
        description= "", } = product || {};

        const imageToShow = images?.[0] || ""
        return (
            <div>
              <image href="logo.png"
              className="">
              </image>
              <section className="">
                <div className="">
                  <Image 
                  className=""
                  />
                  <div className="">
                    <h1 className=""> {product.nom} </h1>
                    <h2 className=""> {product.price} </h2>
                    <button className="">Ajoutez au panier</button>
                  </div>
                </div>
                <div className="">
                  {productSimilar && (
                    productSimilar.map((p) => {
                      <article key={p._id} className="">
                        <CldImage
                        src=""
                        ></CldImage>
                        <h3 className="" >{p.nom}</h3>
                        <span className="">{p.price}</span>
                        <p className="">{p.shortDesc}</p>
                      </article> 
                    })
                  )}
                </div>
              </section>
            </div>
        )
    }