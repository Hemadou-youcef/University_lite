const Record = require("./../models/record")
const AuthController = require("./AuthController")

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
    static get_coefficient(res,subject, info) {
        AuthController.isAboveTheRole(info.user.user_id, 0, false, (result, exist) => {
            if (result) {
                let query = {}
                Record.find(query,(err, subjects)=>{
                    if (subjects != null) {
                        var subjectMap = [];
                        if(subject == -1){
                            subjectMap = [subjects[0].coefficient]
                        }else{
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
}

module.exports = CounterController

