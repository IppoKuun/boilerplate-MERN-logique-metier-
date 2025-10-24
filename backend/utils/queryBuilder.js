
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined; 
};

// A REMPLIR SELON LES CHAMPS DU SCHEMA !!!!
const DEFAULT_ALLOWED_SORT = new Set ([])
const DEFAULT_EQUALS = new Set ([])
const DEFAULT_RANGES = new Set ([])

function setRanges(query, champ){
    const obj = query?.[champ]
    const min = (obj && toNum(obj.min)) ??
    toNum(query?.[`${champ}[min]`]) ??
    toNum(query?.[`${champ}.min`]);
      const max =
    (obj && toNum(obj.max)) ??
    toNum(query?.[`${champ}[max]`]) ??
    toNum(query?.[`${champ}.max`]);

    const out ={}

    out.$gte = min
    out.$lte = max
    return Object.keys(out).length ? out: undefined
}


    export default function queryBuilder(){
        const query = {}, 
        {
            allowedSort = DEFAULT_ALLOWED_SORT,
            equals = DEFAULT_EQUALS,
            ranges = DEFAULT_RANGES,
        } = {}

      filter = {}

    for (const c in equals){
      if ( query[c] !== null && query[c] !== "" ) filter[c] = query[c]
    }

    for ( const c in ranges ) {
      const ranges = setRanges(query, c)
      if (ranges) filter[c] = ranges
    }    
  

  const sortBy = allowedSort.has(String(req.query.sortBy)) ? req.query.sortBy : "createdAt"
  const order = req.query.order?.toLowerCase() === "desc" ? -1 : 1 
  return {sort, sortBy, order }
}