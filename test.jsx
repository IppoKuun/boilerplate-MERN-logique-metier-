// BUT : Afficher le détail d’un produit en SSR via le proxy Next -> backend, sans TypeScript et en Tailwind minimal.

export const revalidate = 0; 
// -> On force un rendu toujours frais (SSR "no-store"). Simple et sûr pour un petit projet.

async function getProduct(id) {
  // Appel du backend via le proxy Next. Public : pas besoin d’envoyer des cookies.
  const res = await fetch(`/api/proxy/products/${id}`, {
    method: 'GET',
    // "no-store" côté fetch pour éviter tout cache ; doublon avec revalidate=0 mais explicite.
    cache: 'no-store',
    // On peut ajouter des headers si ton backend les attend (ici, rien de spécial).
  });

  if (res.status === 404) {
    // Next.js : déclenche la page not-found.js du segment courant
    // (c’est plus propre que de rendre un "Produit introuvable" en plein milieu).
    // On évite aussi les erreurs côté UI.
    const { notFound } = await import('next/navigation');
    return notFound();
  }

  if (!res.ok) {
    // Pour tout autre code d’erreur (500, 400…), on renvoie une erreur claire.
    throw new Error(`Échec du chargement du produit (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data?.data || data; 
  // Selon ton backend : parfois { data: {...} }, parfois l’objet direct.
}

function formatPrice(price, currency = 'EUR', locale = 'fr-FR') {
  // Petit helper : affichage propre des prix (ex: 19,90 €)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price ?? 0);
  } catch {
    return `${price ?? 0} ${currency}`;
  }
}

export default async function ProductPage({ params }) {
  // Next te passe les segments dynamiques dans "params".
  const { id } = params;

  // 1) Charger les données
  const product = await getProduct(id);

  // 2) "Resilient rendering" : on évite le crash si un champ est manquant.
  const {
    title = 'Produit',
    description = '',
    price = 0,
    currency = 'EUR',
    category = 'Divers',
    stock = 0,
    sku = '',
    images = [],
    thumbnail = '',
  } = product || {};

  const imageToShow = thumbnail || images?.[0] || '';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Fil d’ariane minimal (UX) */}
      <nav className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:underline">Accueil</a>
        <span className="mx-2">/</span>
        <a href="/#catalog" className="hover:underline">Produits</a>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image principale */}
        <div className="border rounded-xl p-4">
          {imageToShow ? (
            // Pour éviter la config next/image (domains) au début, on reste sur <img>.
            <img
              src={imageToShow}
              alt={title}
              className="w-full h-auto rounded-lg object-cover"
            />
          ) : (
            <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              Pas d’image
            </div>
          )}
        </div>

        {/* Infos produit */}
        <section>
          <h1 className="text-2xl font-semibold mb-2">{title}</h1>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
            <span className="inline-block bg-gray-100 rounded px-2 py-1">{category}</span>
            {sku && <span className="inline-block bg-gray-100 rounded px-2 py-1">SKU: {sku}</span>}
            <span className={`inline-block rounded px-2 py-1 ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {stock > 0 ? 'En stock' : 'Rupture'}
            </span>
          </div>

          <p className="text-3xl font-bold mb-4">
            {formatPrice(price, currency)}
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            {description || 'Aucune description fournie.'}
          </p>

          <div className="flex items-center gap-3">
            {/* Bouton principal (pas encore de panier global, donc action simulée) */}
            <button
              type="button"
              className="px-5 py-3 rounded-xl bg-black text-white hover:opacity-90"
              onClick={() => alert('Panier à implémenter (prochaines étapes).')}
            >
              Ajouter au panier
            </button>

            {/* Bouton secondaire */}
            <a href="/#catalog" className="px-5 py-3 rounded-xl border hover:bg-gray-50">
              Continuer les achats
            </a>
          </div>
        </section>
      </div>

      {/* Galerie simple si plusieurs images */}
      {images && images.length > 1 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium mb-3">Galerie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.slice(0, 8).map((url, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <img src={url} alt={`${title} ${i + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
