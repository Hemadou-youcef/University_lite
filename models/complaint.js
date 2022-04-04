const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ComplaintSchema = Schema({
    complaint_id :{
        type : Number,
        require: true
    },
    student_id :{
        type : Number,
        require: true
    },
    teacher_id :{
        type : Number,
        require: true
    },
    subject :{
        type : String,
        require: true
    },
    content :{
        type : String,
        require: true
    },
    reply :{
        type : [String],
        require: true
    },
    
},{
    titmestamps: true
});

const complaint = mongoose.model("complaint", ComplaintSchema)
module.exports = complaint