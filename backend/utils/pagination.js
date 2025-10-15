export default function pagination(query = {}, 
    {defaultLimit = 20, maxLimit = 100, defaultPage = 1}) {

        function toInt(v, fallcack) {
            const n = Number(v)
           return Number.isInteger(n) > 0 ? n : fallcack
        }

        const page = toInt(query.page, defaultPage)
        const rawLimit = toInt(query.limit, defaultLimit)
        const limit = mathmin(maxLimit, rawLimit)
        const skip = page = (page - 1) * limit  
    }

    export default function buildMeta(page, limit, total, sortBy, order){
        const pages = Math.max(1, Math.ceil((total || 0) / (limit || 1)))
        const hasNext = page < pages
        const hasPrev = page > 1
        return {hasNext, hasPrev, page, limit, total, sortBy, order }
    }