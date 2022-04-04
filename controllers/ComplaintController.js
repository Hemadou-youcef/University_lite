const Complaint = require("./../models/complaint")

// CONTROLLERS
const CounterController = require("./CounterController")

class ComplaintController {
    // SHOW USERS BY ID IN DB
    static show_complaint(res,id){
        let query = {}
        if(id != -1)
            query = {"user_id":id}
        Complaint.find(query,(err, complaints)=>{
            var complaintMap = [];
            complaints.forEach((complaint,index)=>{
                complaintMap[index] = {
                    "from" : complaint.student_id,
                    "to" : complaint.teacher_id,
                    "subject" : complaint.subject,
                    "content" : complaint.content
                };
            });
            if (complaintMap.length == 0){
                res.status(204)
                res.send({
                    "response":"no complaint found"
                });
            }else{
                res.status(200)
                res.send(complaintMap);
            }
              
        })
    }
    
    // ADD USER IN DB
    static add_complaint(res,info){
        CounterController.get_counter("complaint_counter",true,(index)=>{
            const complaint = new Complaint({
                complaint_id: index,
                student_id : info.student_id,
                teacher_id : info.teacher_id,
                subject : info.subject,
                content : info.content,
                reply : []
            })
            CounterController.inc_counter({"complaint_counter":index},{"complaint_counter":(index + 1)},()=>{
                complaint.save().then((result) => {
                    
                    res.status(201);
                    res.send({
                        "response":"complaint has been added",
                        "ok":1,
                        "data":result
                    })
                })
                .catch((err) => {
                    CounterController.inc_counter({"complaint_counter":index},{"complaint_counter":(index - 1)},()=>{
                        res.status(400);
                        res.send({
                            "response":err,
                            "ok":0
                        })
                    })
                    
                })
            })
            
            
        })
        
    }

    // EDIT COMPLAINT BY ID IN DB
    static edit_complaint(res,id,info){ 
        let content = {
            "content": info.content
        }
        Complaint.updateOne({
                "complaint_id":id
            },content)
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"complaint has been edited",
                    "ok":1,
                    "data":result
                })
            })
            .catch((err) => {
                res.status(400);
                res.send({
                    "response":err,
                    "ok":0
                })
            })
    }

    // DELETE COPMLAINT BY ID IN DB
    static delete_complaint(res,id){
        Complaint.deleteOne({
                "complaint_id":id
            })
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"complaint has been deleted",
                    "ok":1,
                    "data":result
                })
            })
            .catch((err) => {
                res.status(400);
                res.send({
                    "response":err,
                    "ok":0
                })
            })
    }

    // ADD REPLY
    static add_reply(res,info){
        let reply = "[" + info.sender + "]: " + info.content
        Complaint.findOneAndUpdate({
            "complaint_id":parseInt(info.complaint_id)
        },{$push: {"reply" : reply}})
        .then((result) => {
            res.status(200);
            res.send({
                "response":"reply has been added",
                "ok":1,
                "data":result
            })
        })
        .catch((err) => {
            res.status(400);
            res.send({
                "response":err,
                "ok":0
            })
        })
    }

}

module.exports = ComplaintController

