
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined; 
};

// A REMPLIR SELON LES CHAMPS DU SCHEMA !!!!
const DEFAULT_ALLOWED_SORT = new Set ([])
const DEFAULT_EQUALS = new Set ([])
const DEFAULT_RANGES = new Set ([])

export default function setRanges(query, champ){
    const obj = query?.[champ]
    const min = (obj && toNum(obj.min)) ??
    toNum(query?.[`${field}[min]`]) ??
    toNum(query?.[`${field}.min`]);
      const max =
    (obj && toNum(obj.max)) ??
    toNum(query?.[`${field}[max]`]) ??
    toNum(query?.[`${field}.max`]);

    const out ={}

    out.$gte = min
    out.$lte = max
    return Object.keys(out).length ? out: undefined
}


    function queryBuilder(){
        const query = {}, 
        {
            allowedSort = DEFAULT_ALLOWED_SORT,
            equals = DEFAULT_EQUALS,
            ranges = DEFAULT_RANGES,
        } = {}

      filter = {}

    for (c in equals){
      if ( query[c] !== null && query[c] !== "" ) filter[c] = query[c]
    }

    for ( c in ranges ) {
      if (ranges) filter[c] = ranges
    }    
  

  const sortBy = allowedSort.has(String(req.query.sortBy)) ? req.query.sortBy : "createdAt"
  const order = req.query.order.toLowerCase() === "asc" ? 1:-1
  const sort = { [sortBy]: order }
  return {sort, sortBy, order }
}