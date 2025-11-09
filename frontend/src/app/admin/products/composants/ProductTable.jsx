//ProductTable.jsx//

export default function({ loading, products, onEdit, onDeleted, }){
    return(
        <table className="">
            <thead className="">
                <th className="">Nom</th>
                <th className="">Prix</th>
                <th className="">Categories</th>
            </thead>
            <tbody className="">
                {loading && (<tr><td className=""colSpan={4}> Chargement </td></tr>)}
                {!loading && products.length ===0 (<tr><td className="" colSpan={4}> Aucun produit pour l'instant</td></tr>)}
                {!loading && products.map((p)=> {
                    <tr className = "" key={p.id||p._id}>
                        <td className="">{p.name}</td>
                        <td className=""> {Number(p.price).toFixed(2)} </td>
                        <td className=""> {p.categories} </td>
                        <div className="">
                            <button className="" onClick={() => onEdit(p)}> Modifié </button>
                            <button className="" onClick={() => onDeleted(p)}>Supprimé </button>
                        </div>
                    </tr>
                })}
            </tbody>
        </table>
    )
}