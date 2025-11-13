import mongoose from "mongoose"

const { Schema } = mongoose

const AuditEventSchema = new Schema({
    ts : {type: Date, default : () => Date.now(), index:true,},
    event : { type: String, required: true, index:true},
    target : {
        type:{
        type: String},
        slug: String,
        id:String
        
    },
    actor: { 
        user:String, 
        ip:String, 
        role:String, 
        id:String, 
        ua : String
    }, 
    diff:  Schema.Types.Mixed,
    CorrelationId: String,
}, {versionKey : false} )

AuditEventSchema.index({"actor.user" : 1, ts:-1})
AuditEventSchema.index({"target.slug" : 1, ts:-1})

export default mongoose.model("AuditEvent", AuditEventSchema );
