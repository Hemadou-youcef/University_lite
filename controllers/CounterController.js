const Record = require("./../models/record")
const AuthController = require("./AuthController")
const Member = require("./../models/member")
const User = require("./../models/user")

const year_number = {
    "l1": 0, "l2": 1, "l3": 2, "m1": 3, "m2": 4
}

class CounterController {
    static result = null;
    // SHOW MEMBER BY ID IN DB
    static get_counter(info, create_counter, cb) {
        const all = Record.find({}, (err, counters) => {
            var CounterMap = [];
            var response;

            counters.forEach((counter, index) => {
                CounterMap[index] = {
                    "user_counter": counter.user_counter,
                    "member_counter": counter.member_counter,
                    "complaint_counter": counter.complaint_counter
                };
            });

            if (CounterMap.length == 0) {
                if (create_counter) {
                    let query = {
                        user_counter: 0,
                        member_counter: 0,
                        complaint_counter: 0,
                        coefficient: []
                    }
                    query[info] = 1
                    const counter = new Record(query)
                    counter.save()
                    response = 0
                } else {
                    response = false
                }
            } else {

                for (var i in CounterMap[0]) {
                    if (i == info) {
                        response = CounterMap[0][i]
                        break;
                    }
                }
            }
            cb(response)

        })
    }
    static inc_counter(old_counter, new_counter, cb) {
        Record.updateOne(old_counter, new_counter).then((result) => {
            cb()
        })
    }
    static get_coefficient(res, subject, info) {
        AuthController.isAboveTheRole(info.user.user_id, 0, false, (result, exist) => {
            if (result) {
                let query = {}
                Record.find(query, (err, subjects) => {
                    if (subjects != null) {
                        var subjectMap = [];
                        if (subject == -1) {
                            subjectMap = [subjects[0].coefficient]
                        } else {
                            [subjects[0].coefficient].forEach((value) => {
                                if (Object.keys(value)[0] == subject) {
                                    subjectMap.push(value)
                                }
                            })
                        }
                        res.status(200)
                        res.send(subjectMap);
                    } else {
                        res.status(204)
                        res.send({
                            "response": "no member found",
                            "ok": 0
                        });
                    }

                })
            } else {
                res.status(401).send({
                    "response": "sorry you don't have permission",
                    "ok": 0
                })
            }
        })
    }
    static add_coefficient(res, info) {
        AuthController.isAboveTheRole(info.user.user_id, 3, false, (result, exist) => {
            if (result) {
                let query = {}
                query[info.subject.toLowerCase()] = info.coefficient

                Record.updateMany({},
                    { $push: { "coefficient": query } }
                )
                    .then((result) => {
                        res.status(200);
                        res.send({
                            "response": "subject has been added",
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
                res.status(401).send({
                    "response": "sorry you don't have permission",
                    "ok": 0
                })
            }
        })
    }
    static edit_coefficient(res, info) {
        AuthController.isAboveTheRole(info.user.user_id, 3, false, (result, exist) => {
            if (result) {
                let query = {}
                let sets = {}
                query[info.subject] = info.coefficient
                sets["coefficient." + info.subject] = info.old

                Record.updateMany(sets,
                    { $set: { "coefficient.$": query } }
                )
                    .then((result) => {
                        res.status(200);
                        res.send({
                            "response": "subject has been added",
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
                res.status(401).send({
                    "response": "sorry you don't have permission",
                    "ok": 0
                })
            }
        })
    }
    static delete_coefficient(res, info) {
        AuthController.isAboveTheRole(info.user.user_id, 3, false, (result, exist) => {

            if (result) {
                let query = {}
                query[info.subject] = info.old
                Record.find(query, (err, subjects) => {
                    if (subjects != null) {
                        var subjectMap = subjects[0].coefficient;
                        let filtredSubject = []
                        subjectMap.forEach((value) => {
                            if (Object.keys(value)[0] != info.subject) {
                                filtredSubject.push(value)
                            }
                        })
                        Record.updateMany({},
                            { $set: { "coefficient": filtredSubject } }
                        )
                            .then((result) => {
                                res.status(200);
                                res.send({
                                    "response": "coefficient has been deleted",
                                    "ok": 1
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
                        res.status(204)
                        res.send({
                            "response": "no member found",
                            "ok": 0
                        });
                    }

                })
            } else {
                res.status(401).send({
                    "response": "sorry you don't have permission",
                    "ok": 0
                })
            }
        })
    }
    static async get_pv(res, info, id, year, season) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let same = false
        if (id == "me" && src_.length > 0) {
            if (src_[0].role == 1) {
                same = true
            }
        }

        AuthController.isAboveTheRole(info.user.user_id, 3, same, (result, exist) => {
            if (result) {
                let query = {}
                Record.find(query, (err, subjects) => {
                    if (subjects != null) {
                        var subjectMap = []
                        subjectMap = subjects[0].coefficient

                        
                        // console.log(subjectMap)
                        if (same) {
                            query["member_id"] = src_[0].user_refere
                        }else{
                            query["member_id"] = 
                            query = {"status.state": "student", "marks.year": year }
                        }
                        
                        Member.find(query, function (err, members) {
                            if (members.length > 0) {
                                var mark = []
                                members.forEach((value, index) => {
                                    var temp_mark = []
                                    value.marks[year_number[year]][season].forEach(function (member, index) {
                                        
                                        if (member.toLowerCase().includes(":")) {
                                            subjects[0].coefficient.forEach((module_value) => {
                                                if (Object.keys(module_value)[0] == member.split(":")[0]) {
                                                    temp_mark.push([parseInt(Object.values(module_value)[0]),member.split(":")[0], parseInt(value.marks[year_number[year]][season][index].split(":")[1])])
                                                }
                                            })
                                            
                                        }
                                    });
                                    
                                    let sum_coef = 0
                                    let final_mark = 0
                                    temp_mark.forEach(value=>{
                                        sum_coef += value[0]
                                        final_mark += value[0] * value[2]
                                    })
                                    temp_mark.unshift(final_mark / sum_coef)
                                    temp_mark.unshift([value.name + " " + value.surname, value.member_id])
                                    mark.push(temp_mark)
                                })



                                res.send({
                                    "response": mark,
                                    "ok": 1
                                });
                            } else {
                                res.send({
                                    "response": "no member found",
                                    "ok": 0
                                });
                            }
                        })
                    } else {
                        res.status(204)
                        res.send({
                            "response": "no member found",
                            "ok": 0
                        });
                    }

                })

            } else {

            }
        })
    }
}

module.exports = CounterController

