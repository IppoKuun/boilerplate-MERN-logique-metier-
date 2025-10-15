import bcrypt from "bcrypt"


export const BCRYPT_COST = 12
//On hash ce que user nous donne avec son sel//
export async function hashPassword(plain){
    if (typeof plain !== "string" || plain.length === 0)
         throw new Error ("MDP vide ou pas string")
    const sel = await bcrypt.genSalt(BCRYPT_COST)
    const hash = await bcrypt.hash(plain, sel)
    return hash
}
// Fonction qui vas servir a voir si le hash et si ce qui est ecrit par user est bien identique//
export async function verifyPassword(plain, hash){
  if (typeof plain !== "string" || plain.length === 0) return false;
  if (typeof hash !== "string" || hash.length === 0) return false;
  return bcrypt.compare(plain, hash)
}