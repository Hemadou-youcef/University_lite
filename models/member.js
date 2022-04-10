const mongoose = require("mongoose")
const Schema = mongoose.Schema

const MemberSchema = Schema({
    member_id :{
        type : Number,
        require: true
    },
    name :{
        type : String,
        require: true
    },
    surname :{
        type : String,
        require: true
    },
    birth :{
        type : Date,
        require: false
    },
    gender : {
        type: String,
        require:true,
    },
    Residence :{
        type : String,
        require: true
    },
    marks : {
        type : [Map],
        require:false
    },
    status :{
        type: Map,
        of: String,
        require: true
    }
},{
    titmestamps: true
})

const Member = mongoose.model("member", MemberSchema)
module.exports = Member