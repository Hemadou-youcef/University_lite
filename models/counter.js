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
    }
},{
    titmestamps: true
});

const user = mongoose.model("counter", UserSchema)
module.exports = user