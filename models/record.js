const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = Schema({
    user_counter : {
        type : Number
    },
    member_counter : {
        type : Number
    },
    complaint_counter : {
        type : Number
    },
    coefficient:{
        type : []
    }
},{
    titmestamps: true
});

const user = mongoose.model("record", UserSchema)
module.exports = user