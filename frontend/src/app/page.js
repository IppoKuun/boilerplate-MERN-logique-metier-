import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import api from "./lib/api";

const getCategories = (products) => {
  const cat = products.map((p) => {p.category})
  const s = new Set([cat])
  return["toutes",... Arrayfrom(s)]}

  const mapSort = (s) => {
    switch(s){
      case "asc": return {sortBy:price, order:asc};
      case "desc": return {sortBy: price, order: desc};
      case "recent" :return {}
    }
  }
export default function Home() {
  const [products, setAllproducts]= useState({})
  const [minPrice, setMinPrice] =useState(0)
  const [maxPrice, setMaxPrice] = useState(100)
  const [category, setCategory] = useState("")

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const params = useMemo (()=> {
    const p = {}
    if (category && category !== "toutes") p.category = category;
    if (minPrice !== "") p["minPrice"] = minPrice;
    if (maxPrice !== "") p["maxPrice"] = maxPrice;
    //A VOIR PLUS TARD//
    const m = mapSort(p)
    if

  })

  useEffect(()=> {
    let compAlive = true,
    const controllers = new AbortController()
    setTimeout( async () => {
      try{
        setLoading(true)
        setErr(false)

        const res = await api.get("/products", {params, signal: controllers.signal })

        const items= 
      } catch(e){

      } finally {

      }
    }, 250)
  }, [params])
  

  const 

  return (
    <div>

    </div>
  );
}
