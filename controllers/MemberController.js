const Member = require("./../models/member")
const User = require("./../models/user")

// CONTROLLERS
const CounterController = require("./CounterController")
const AuthController = require("./AuthController")

//CONSTANTS
const year_number = {
    "l1":0,"l2":1,"l3":2,"m1":3,"m2":4
}

class MemberController {
    // SHOW MEMBER BY ID IN DB
    static async show_member(res,id,state,info){

        let src = {"_id":info.user.user_id}
        const src_ = await User.find(src)
        let same = false
        if(id == "me" && src_[0].user_refere != -1){
            same = true,
            id = src_[0].user_refere
            state = false
        }else if(state == "member"){
            state = false
        }
        AuthController.isAboveTheRole(info.user.user_id,3,same,(result,exist)=>{
            if(result){
                let query = {"status.state":state}
                if(id != -1)
                    if(state === false){
                        query = {"member_id":id}
                    }else{
                        query = {"member_id":id,"status.state":state}
                    }
                    
                Member.find(query, function(err, members) {
                    if(members != null){
                        var memberMap = [];

                        members.forEach(function(member,index) {
                            memberMap[index] = {
                                "member_id" : member.member_id,
                                "member_name" : member.name,
                                "member_surname" : member.surname,
                                "member_birth" : member.birth,
                                "member_gender" :member.gender,
                                "member_residence" : member.Residence,
                                "member_status" : member.status
                            };
                        });
                        res.status(200)
                        res.send(memberMap);
                    }else{
                        res.status(204)
                        res.send({
                            "response":"no member found",
                            "ok":0
                        });
                    }
                    
                })
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"member not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
    }

    // ADD MEMBER IN DB
    static add_member(res,info){
        AuthController.isAboveTheRole(info.user.user_id,3,false,(result,exist)=>{
            if(result){
                CounterController.get_counter("member_counter",true,(index)=>{
                    let x;
                    if(info.status.state == "student"){
                        x = new Member({
                            member_id : index,
                            name : info.name,
                            surname : info.surname,
                            birth : info.birth,
                            Residence : info.Residence,
                            gender: info.gender,
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
                            gender : info.gender,
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
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        
    }
    
    // EDIT MEMBER BY ID IN DB
    static edit_member(res,id,info){ 
        AuthController.isAboveTheRole(info.user.user_id,3,false,(result,exist)=>{
            if(result){
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
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        
    }

    // DELETE MEMBER BY ID IN DB
    static delete_member(res,id,info){
        AuthController.isAboveTheRole(info.user.user_id,3,false,(result,exist)=>{
            if(result){
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
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        
    }
    
    static async get_mark(res,info,id,year,season,subject){
        let src = {"_id":info.user.user_id}
        const src_ = await User.find(src)
        let same = false
        if(id == "me"){
            same = true
            id = src_[0].user_refere
        }else if(src_[0].user_refere == id){
            same = true
        }
        const member_ = await Member.find({"member_id":id})
        AuthController.isAboveTheRole(info.user.user_id,2,same,(result,exist)=>{
            if(result){
                let query = {}
                if(member_[0].status.get("state") == "teacher"){
                    query = {"status.years":year,"marks.year":year}
                }else{
                    query = {"member_id":id,"status.years":year,"marks.year":year}
                }
                // console.log(query)
                Member.findOne(query, function(err, members) {
                    if(members != null){
                        var mark = {}
                        if(subject == -1){
                            subject = ":"
                        }
                        
                        members.marks[year_number[year]].get(season).forEach(function(member,index) {
                            if(member.toLowerCase().includes(subject)){
                                if(subject = ":"){
                                    mark[member.split(":")[0]] = [members.member_id,parseInt(members.marks[year_number[year]].get(season)[index].split(":")[1])]
                                }else{
                                    mark[subject] = [members.member_id,parseInt(members.marks[year_number[year]].get(season)[index].split(":")[1])]
                                }
                                
                            }
                        });
                        const isEmpty = Object.keys(mark).length === 0;
                        if (isEmpty){
                            res.send({
                                "response":"no mark found",
                                "ok":0
                            });
                        }else{
                            mark["info"] = members.member_name + " " + members.surname
                            res.status(200)
                            res.send(mark);
                        }
                    }else{
                        res.send({
                            "response":"no member found",
                            "ok":0
                        });
                    }
                })
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        

        
    }
    static add_mark(res,info){
        AuthController.isRole(info.user.user_id,2,false,(result,exist)=>{
            if(result){
                AuthController.isSubjectTeacher(info.user.user_id,info.subject,(result,exist)=>{
                    if(result){
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
                    }else{
                        if(!exist[1]){
                            res.status(401).send({
                                "response":"teacher not found",
                                "ok":0
                            })
                        }else{
                            res.status(401).send({
                                "response":"sorry you are not a teacher of this subject",
                                "ok":0
                            })
                        }
                    }
                })
                
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        
    }
    // EDIT MARK  IN DB
    static edit_mark(res,id,info){
        AuthController.isRole(info.user.user_id,2,false,(result,exist)=>{
            if(result){
                AuthController.isSubjectTeacher(info.user.user_id,info.MemberControllersubject,(result,exist)=>{
                    if(result){
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
                    }else{
                        if(!exist[1]){
                            res.status(401).send({
                                "response":"teacher not found",
                                "ok":0
                            })
                        }else{
                            res.status(401).send({
                                "response":"sorry you are not a teacher of this subject",
                                "ok":0
                            })
                        }
                    }
                })
                
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        
    }
    static delete_mark(res,id,info){
        AuthController.isRole(info.user.user_id,2,false,(result,exist)=>{
            if(result){
                AuthController.isSubjectTeacher(info.user.user_id,info.subject,(result,exist)=>{
                    if(result){
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
                    }else{
                        if(!exist[1]){
                            res.status(401).send({
                                "response":"teacher not found",
                                "ok":0
                            })
                        }else{
                            res.status(401).send({
                                "response":"sorry you are not a teacher of this subject",
                                "ok":0
                            })
                        }
                    }
                })
                
            }else{
                if(!exist){
                    res.status(401).send({
                        "response":"user not found",
                        "ok":0
                    })
                }else{
                    res.status(401).send({
                        "response":"sorry you don't have permission",
                        "ok":0
                    })
                }
            }
        })
        
    }

}

module.exports = MemberController

