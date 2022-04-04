const Member = require("./../models/member")

// CONTROLLERS
const CounterController = require("./CounterController")

//CONSTANTS
const year_number = {
    "l1":0,"l2":1,"l3":2,"m1":3,"m2":4
}

class MemberController {
    // SHOW MEMBER BY ID IN DB
    static show_member(res,id,state){
        let query = {"status.state":state}
        if(id != -1)
            query = {"member_id":id,"status.state":state}
        Member.find(query, function(err, members) {
            var memberMap = [];

            members.forEach(function(member,index) {
                memberMap[index] = {
                    "member id" : member.member_id,
                    "member name" : member.name,
                    "member surname" : member.surname,
                    "member birth" : member.birth,
                    "member status" : member.status
                };
            });
            if (memberMap.length == 0){
                res.status(204)
                res.send({
                    "response":"no member found"
                });
            }else{
                res.status(200)
                res.send(memberMap);
            }
              
        })
    }

    // ADD MEMBER IN DB
    static add_member(res,info){
        CounterController.get_counter("member_counter",true,(index)=>{
            let x;
            if(info.status.state == "student"){
                x = new Member({
                    member_id : index,
                    name : info.name,
                    surname : info.surname,
                    birth : info.birth,
                    Residence : info.Residence,
                    marks: info.marks,
                    status : info.status
                })
            }else{
                x = new Member({
                    member_id : index,
                    name : info.name,
                    surname : info.surname,
                    birth : info.birth,
                    Residence : info.Residence,
                    status : info.status
                })
            }
            const member = x
            CounterController.inc_counter({"member_counter":index},{"member_counter":(index + 1)},()=>{
                member.save().then((result) => {
                    res.status(201);
                    res.send({
                        "response":"member has been added",
                        "ok":1,
                        "data":result
                    })
                })
                .catch((err) => {
                    CounterController.inc_counter({"member_counter":index},{"member_counter":(index - 1)},()=>{
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
    
    // EDIT MEMBER BY ID IN DB
    static edit_member(res,id,info){ 
        Member.updateOne({
                "member_id":id
            },info)
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"member has been edited",
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

    // DELETE MEMBER BY ID IN DB
    static delete_member(res,id){
        Member.deleteOne({
                "member_id":id
            })
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"member has been deleted",
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
    static add_mark(res,info){
        let mark = info.subject + ":" + info.mark
        Member.findOneAndUpdate({
            "member_id":parseInt(info.member_id),
            "marks.year":info.year,
        },{$push: {"marks.$.s1" : mark}})
        .then((result) => {
            res.status(200);
            res.send({
                "response":"mark has been added",
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
    static get_mark(res,id,year,season,subject){
        let query = {"member_id":id,"marks.year":year}

        Member.findOne(query, function(err, members) {
            var mark = {}
            if(subject == -1){
                subject = ":"
            }
            members.marks[year_number[year]].get(season).forEach(function(member,index) {
                if(member.toLowerCase().includes(subject)){
                    if(subject = ":"){
                        mark[member.split(":")[0]] = parseInt(members.marks[year_number[year]].get(season)[index].split(":")[1])
                    }else{
                        mark[subject] = parseInt(members.marks[year_number[year]].get(season)[index].split(":")[1])
                    }
                    
                }
            });
            const isEmpty = Object.keys(mark).length === 0;
            if (isEmpty){
                res.status(204)
                res.send({
                    "response":"no member found"
                });
            }else{
                res.status(200)
                res.send(mark);
            }
              
        })
    }
    // EDIT MARK  IN DB
    static edit_mark(res,id,info){
        let marks = {}
        let filter = {}

        filter["member_id"] = parseInt(id)
        marks["marks." + year_number[info.year.toLowerCase()] + "." + info.season] = info.subject + ":" + info.old_mark

        Member.findOneAndUpdate(filter,{$pull: marks})
            .then((result) => {
                marks["marks." + year_number[info.year.toLowerCase()] + "." + info.season] = info.subject + ":" + info.mark
                Member.findOneAndUpdate(filter,{$push: marks})
                .then((result) => {
                    res.status(200);
                    res.send({
                        "response":"mark has been edited",
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
            })
            .catch((err) => {
                res.status(400);
                res.send({
                    "response":err,
                    "ok":0
                })
            })
    }
    static delete_mark(res,id,info){
        let marks = {}
        let filter = {}

        filter["member_id"] = parseInt(id)
        marks["marks." + year_number[info.year.toLowerCase()] + "." + info.season] = info.subject + ":" + info.mark

        Member.findOneAndUpdate(filter,{$pull: marks})
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"mark has been deleted",
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

    static add_complaint(res,info){
        let complaint = {
            "student_id" : info.member_id,
            "subject_name" : info.subject,
            "content": info.content,
            "reply":[]
        }
        Member.findOneAndUpdate({
            "member_id":parseInt(info.member_id)
        },{$push: {"complaints" : complaint}})
        .then((result) => {
            res.status(200);
            res.send({
                "response":"complaint has been added",
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

    static delete_complaint(res,id,info){
        let marks = {}
        let filter = {}

        filter["member_id"] = parseInt(id)
        filter["student_id"] = info.student_id
        filter["subject_name"] = info.subject

        marks["marks." + year_number[info.year.toLowerCase()] + "." + info.season] = info.subject + ":" + info.mark

        Member.findOneAndUpdate(filter,{$pull: marks})
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"mark has been deleted",
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

module.exports = MemberController

