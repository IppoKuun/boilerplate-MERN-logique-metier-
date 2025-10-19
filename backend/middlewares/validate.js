import Joi from "joi"
import sanitizeObject from "../utils/sanitize"


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

export default function Validate( schemaMap = {}, options = {}) {
    const parts = ["body", "params", "headers", "query"].filter(p => schemaMap[p])
    
    if (parts.length === 0) {
        return function noopValidate(_req, _res, next) {
        return next();
        };
    }

    function validateMiddleware(req, res, next) {
        for (const part of parts){
            const schema = schemaMap[part]

            let input = req[part] ?? {}
            if (part !== "headers"){
                input = sanitizeObject(input)
            }

            const JoiOPTS = (part === "headers")? 
                {...DEFAULT_JOI, allowUnknow :true }: {DEFAULT_JOI}

        const { error, value } = schema.validate(input, JoiOPTS);
        if (error){
            return res.status(400).json({
                err: "Validation err",
                where: part,
                details: formatJoiError(error)
            })
        }
    req[part] = value
    }
    return next()
    }
}

    