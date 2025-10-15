import Basejoi from "joi"
import sanitze from sanitizeFilter.js

export const Joi = Basejoi

const DEFAULT_JOI = Object.freeze({
    convert:true,
    abortEarly:false,
    stripUnknown:true,
    allowUnknown:false,
})

function formatJoiError (err)  {
    if (!err.details) {return []}
    return err.details.map(e => ({
        path : Array.isArray(e.path) ? e.path.join(".") : String(e.path ?? "") ,
        message: String(e.message || "").replace(/["]/g, "'"),
        type: e.type || "validation error"
    }))
}

function validate( schemaMap = {}, options = {}) {
    const reqPart = ["body", "params", "headers", "query"].filter(p => p.reqPart)

     function noValidation(req, res, next){
        if (reqPart.length === 0) return next()
    }

    function validateMiddleware() {
        for (const part of reqPart){
            const schema = schemaMap[part]

            const input = req[part] ?? {}
            if (!part === "headers"){
                input = sanitze(input)
            }

            const JoiOPTS = (part === "headers")? 
                {...DEFAULT_JOI, allowUnknow :true }: {DEFAULT_JOI}
            }

        const { error, value } = schema.validate(input, JoiOPTS);
        if (error){
            return  res.status(400).json({
                err: "Validation err",
                where: part,
                details: formatJoiError(error)
            })
        }
        req[part] = value
        }
                   return next()
    }
