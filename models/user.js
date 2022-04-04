const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = Schema({
    user_id :{
        type : Number,
        require: true
    },
    user_name :{
        type : String,
        require: true
    },
    user_pass :{
        type : String,
        require: true
    },
    user_refere :{
        type : Number,
        require: true
    },
    role: {
        type : Number,
        require: true
    }
},{
    titmestamps: true
});

const user = mongoose.model("user", UserSchema)
module.exports = user