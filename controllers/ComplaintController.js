const Complaint = require("./../models/complaint")
const User = require("./../models/user")
const Member = require("./../models/member")

// CONTROLLERS
const CounterController = require("./CounterController")
const AuthController = require("./AuthController")

class ComplaintController {
    // SHOW USERS BY ID IN DB
    static async show_complaint(res, id, from, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let same = false

        if (src_[0].user_refere != -1 && src_[0].role >= 1) {
            let query = {}
            query[from + "_id"] = src_[0].user_refere
            console.log(query)
            const complaint_ = await Complaint.find(query)
            if (complaint_.length >= 1) {
                same = true
            }
        }
        console.log(same)
        AuthController.isAboveTheRole(info.user.user_id, 2, same, (result, exist) => {
            if (result) {
                let query = {}
                if (src_[0].role == 2) {
                    query = { "teacher_id": src_[0].user_refere }
                    if (id != -1)
                        query["complaint_id"] = id

                }else if(src_[0].role >= 3){

                } else {
                    query[from + "_id"] = src_[0].user_refere
                    if (id != -1)
                        query = { "complaint_id": id }
                }

                
                Complaint.find(query, (err, complaints) => {
                    
                    if (complaints != null) {
                        var complaintMap = [];
                        complaints.forEach((complaint, index) => {
                            complaintMap[index] = {
                                "id": complaint.complaint_id,
                                "name" : complaint.student_name,
                                "from": complaint.student_id,
                                "to": complaint.teacher_id,
                                "subject": complaint.subject,
                                "content": complaint.content,
                                "reply": complaint.reply
                            };
                        });
                        res.status(200)
                        res.send(complaintMap);
                    } else {
                        res.status(204)
                        res.send({
                            "response": "no complaint found"
                        });
                    }

                })
            } else {
                if (!exist) {
                    res.status(401).send({
                        "response": "user not found",
                        "ok": 0
                    })
                } else {
                    res.status(401).send({
                        "response": "sorry you don't have permission",
                        "ok": 0
                    })
                }
            }
        })

    }

    // ADD USER IN DB
    static async add_complaint(res, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let student = false
        if (src_[0].role == 1) {
            student = true
        }
        const teacher_ = await Member.find({ "status.subject": info.subject })
        const student_ = await Member.find({ "member_id": src_[0].user_refere })
        if (student && teacher_.length > 0 && student_.length > 0) {
            CounterController.get_counter("complaint_counter", true, (index) => {
                const complaint = new Complaint({
                    complaint_id: index,
                    student_id: info.student_id,
                    student_name: student_[0].name + " " + student_[0].surname,
                    teacher_id: teacher_[0].member_id,
                    subject: info.subject,
                    content: info.content,
                    reply: []
                })
                CounterController.inc_counter({ "complaint_counter": index }, { "complaint_counter": (index + 1) }, () => {
                    complaint.save().then((result) => {
                        res.status(201);
                        res.send({
                            "response": "complaint has been added",
                            "ok": 1,
                            "data": result
                        })
                    })
                        .catch((err) => {
                            CounterController.inc_counter({ "complaint_counter": index }, { "complaint_counter": (index - 1) }, () => {
                                res.status(400);
                                res.send({
                                    "response": err,
                                    "ok": 0
                                })
                            })

                        })
                })




            })
        } else {
            res.status(401);
            res.send({
                "response": "you are not a student",
                "ok": 0
            })
        }



    }

    // EDIT COMPLAINT BY ID IN DB
    static async edit_complaint(res, id, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let student = false
        if (src_[0].role == 1) {
            student = true
        }
        if (student) {
            let content = {
                "content": info.content
            }
            Complaint.updateOne({
                "complaint_id": id
            }, content)
                .then((result) => {
                    res.status(200);
                    res.send({
                        "response": "complaint has been edited",
                        "ok": 1,
                        "data": result
                    })
                })
                .catch((err) => {
                    res.status(400);
                    res.send({
                        "response": err,
                        "ok": 0
                    })
                })
        } else {
            res.status(401);
            res.send({
                "response": "you are not a student",
                "ok": 0
            })
        }
    }

    // DELETE COPMLAINT BY ID IN DB
    static async delete_complaint(res, id, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let same = false
        if (src_[0].role == 1) {
            same = true
        }
        AuthController.isAboveTheRole(info.user.user_id, 2, same, (result, exist) => {
            if (result) {
                if (same) {
                    AuthController.isHaveAComplaint(info.user.user_id,id, (result2, exist) => {
                        if (result2) {
                            Complaint.deleteOne({
                                "complaint_id": id
                            })
                                .then((result2) => {
                                    res.status(200);
                                    res.send({
                                        "response": "complaint has been deleted",
                                        "ok": 1,
                                        "data": result2
                                    })
                                })
                                .catch((err) => {
                                    res.status(400);
                                    res.send({
                                        "response": err,
                                        "ok": 0
                                    })
                                })
                        } else {
                            if (!exist) {
                                res.status(401).send({
                                    "response": "user not found",
                                    "ok": 0
                                })
                            } else {
                                res.status(401).send({
                                    "response": "sorry you don't have the complaint",
                                    "ok": 0
                                })
                            }
                        }
                    })
                } else {
                    Complaint.deleteOne({
                        "complaint_id": id
                    })
                        .then((result) => {
                            res.status(200);
                            res.send({
                                "response": "complaint has been deleted",
                                "ok": 1,
                                "data": result
                            })
                        })
                        .catch((err) => {
                            res.status(400);
                            res.send({
                                "response": err,
                                "ok": 0
                            })
                        })
                }

            } else {
                if (!exist) {
                    res.status(401).send({
                        "response": "user not found",
                        "ok": 0
                    })
                } else {
                    res.status(401).send({
                        "response": "sorry you don't have permission",
                        "ok": 0
                    })
                }
            }
        })

    }

    // ADD REPLY
    static async add_reply(res, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let same = false
        if (src_[0].role == 1) {
            same = true
        }
        AuthController.isAboveTheRole(info.user.user_id, 2, same, (result, exist) => {
            if (result) {
                if (same) {
                    AuthController.isHaveAComplaint(info.user.user_id, info.complaint_id, (result, exist) => {
                        if (result) {
                            let reply = "[" + info.sender + "]: " + info.content
                            Complaint.findOneAndUpdate({
                                "complaint_id": parseInt(info.complaint_id)
                            }, { $push: { "reply": reply } })
                                .then((result) => {
                                    res.status(200);
                                    res.send({
                                        "response": "reply has been added",
                                        "ok": 1,
                                        "data": result
                                    })
                                })
                                .catch((err) => {
                                    res.status(400);
                                    res.send({
                                        "response": err,
                                        "ok": 0
                                    })
                                })
                        } else {
                            if (!exist) {
                                res.status(401).send({
                                    "response": "user not found",
                                    "ok": 0
                                })
                            } else {
                                res.status(401).send({
                                    "response": "sorry you don't have the complaint",
                                    "ok": 0
                                })
                            }
                        }
                    })
                } else {
                    let query = {}
                    if (src_[0].role == 2) {
                        query = { "teacher_id": src_[0].user_refere }
                        if (parseInt(info.complaint_id) != -1)
                            query["complaint_id"] = parseInt(info.complaint_id)
                    } else {
                        if (parseInt(info.complaint_id) != -1)
                            query = { "complaint_id": parseInt(info.complaint_id) }
                    }
                    let reply = "[" + info.sender + "]: " + info.content
                    Complaint.findOneAndUpdate(query, { $push: { "reply": reply } })
                        .then((result) => {
                            res.status(200);
                            res.send({
                                "response": "reply has been added",
                                "ok": 1,
                                "data": result
                            })
                        })
                        .catch((err) => {
                            res.status(400);
                            res.send({
                                "response": err,
                                "ok": 0
                            })
                        })
                }

            } else {
                if (!exist) {
                    res.status(401).send({
                        "response": "user not found",
                        "ok": 0
                    })
                } else {
                    res.status(401).send({
                        "response": "sorry you don't have permission",
                        "ok": 0
                    })
                }
            }
        })

    }

}

module.exports = ComplaintController

