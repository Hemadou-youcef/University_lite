const User = require("./../models/user")
const Member = require("./../models/member")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
// CONTROLLERS
const CounterController = require("./CounterController")
const AuthController = require("./AuthController")

class UserController {
    // REGISTER USER IN DB
    static async register(res, info) {
        const { first_name, last_name, user_name, password } = info;

        if (!(first_name && last_name && user_name && password)) {
            res.status(200);
            res.send({
                "response": "All input is required",
                "ok": 0
            })
            return false;
        }
        const oldUser = await User.findOne({ user_name });

        if (oldUser) {
            res.status(200);
            res.send({
                "response": "User Already Exist. Please Login",
                "ok": 0
            })
            return false;
        }

        let encryptedPassword = await bcrypt.hash(password, 10);
        CounterController.get_counter("user_counter", true, (index) => {
            let role = 0
            if (index == 0 || index == 1 || index == 2) {
                role = 3
            }
            const user = new User({
                user_id: index,
                first_name,
                last_name,
                user_name,
                user_pass: encryptedPassword,
                token: "",
                user_refere: -1,
                role: role
            })
            CounterController.inc_counter({ "user_counter": index }, { "user_counter": (index + 1) }, () => {
                user.save().then((result) => {
                    const token = jwt.sign(
                        { user_id: result._id, user_name, role: 0 },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: "24h",
                        }
                    );

                    user.token = token;

                    res.status(201);
                    res.send({
                        "response": "user has been added",
                        "ok": 1,
                        "data": {
                            "user_id": index,
                            "user_name": result.user_name,
                            "token": user.token
                        }
                    })
                })
                    .catch((err) => {
                        CounterController.inc_counter({ "user_counter": index }, { "user_counter": (index - 1) }, () => {
                            res.status(200);
                            res.send({
                                "response": err,
                                "ok": 0
                            })
                        })

                    })
            })


        })

    }

    // LOGIN USER IN DB
    static async login(res, info) {
        try {
            const { user_name, password } = info;

            if (!(user_name && password)) {
                res.status(200);
                res.send({
                    "response": "All input is required",
                    "ok": 0
                })
                return false;
            }

            const user = await User.findOne({ user_name });

            if (user && (await bcrypt.compare(password, user.user_pass))) {
                console.log(user_name)
                const token = jwt.sign(
                    { user_id: user._id, user_name, role: user.role },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "24h",
                    }
                );

                user.token = token;

                res.status(200)
                res.send({
                    "response": "connected",
                    "ok": 1,
                    "data": {
                        "firstname": user.first_name,
                        "lastname": user.lastname,
                        "user-name": user.username,
                        "token": user.token
                    }
                })
                return true;
            } else if (!user) {
                res.status(200);
                res.send({
                    "response": "user name not found",
                    "ok": 0
                })
            } else {
                res.status(200);
                res.send({
                    "response": "password is incorrect",
                    "ok": 0
                })
            }

            return false;
        } catch (err) {
            console.log(err);
        }
    }
    // SHOW USERS BY ID IN DB
    static async show_users(res, id, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        let same = false
        if (id == "me") {
            same = true,
                id = src_[0].user_id
        } else if (src_[0].user_id == id) {
            same = true
        }
        AuthController.isAboveTheRole(info.user.user_id, 3, same, (result, exist) => {
            if (result) {
                let query = {}
                if (id != -1)
                    query = { "user_id": id }
                User.find(query, (err, users) => {
                    if (users != null) {
                        var userMap = [];
                        users.forEach((user, index) => {
                            userMap[index] = {
                                "firstname": user.first_name,
                                "lastname": user.last_name,
                                "user_id": user.user_id,
                                "user_name": user.user_name,
                                "user_refere": user.user_refere,
                                "role": (user.role == 3) ? 'CHEF' : ((user.role == 2) ? 'TEACHER' : ((user.role == 1) ? 'STUDENT' : "GUEST"))
                            };
                        });

                        res.status(200)
                        if (userMap.length == 1) {
                            res.send(userMap[0]);
                        } else {
                            res.send(userMap);
                        }
                    } else {
                        res.status(204)
                        res.send({
                            "response": "no user found",
                            "ok": 0
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

    // EDIT USER BY ID IN DB
    static edit_user(res, id, info, message) {
        User.updateOne({
            "user_id": id
        }, info)
            .then((result) => {
                res.status(200);
                res.send({
                    "response": message,
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
    }
    static async grant_permission(res, id, info) {
        const src_ = await User.find({ user_id: id })

        if (src_.length == 1) {
            const member_ = await Member.find({ "member_id": src_[0].user_refere })

            AuthController.isAboveTheUserRole(info.user.user_id, id, (result, exist) => {
                if (!result) {
                    if (!exist) {
                        res.send({
                            "response": "user not found",
                            "ok": 0
                        })
                    } else {
                        res.send({
                            "response": "sorry you don't have permission",
                            "ok": 0
                        })
                    }
                } else {
                    let role = {
                        "role": info.role
                    }
                    if (member_.length >= 1) {
                        let state = member_[0].status.get("state")
                        console.log(member_[0].status.get("state"))
                        if ((state.toLowerCase() == "teacher") && info.role == 2) {
                            UserController.edit_user(res, id, role, "permission granted successfully")
                        } else if ((state.toLowerCase() == "student") && info.role == 1) {
                            UserController.edit_user(res, id, role, "permission granted successfully")
                        } else {
                            res.send({
                                "response": "sorry we can't do it",
                                "ok": 0
                            })
                        }
                    } else {
                        if (info.role == 3 || info.role == 0) {
                            UserController.edit_user(res, id, role, "permission granted successfully")
                        }
                        
                    }



                }
            })
        }
    }
    static async link_account(res, id, info) {
        let src = { "_id": info.user.user_id }
        const src_ = await User.find(src)
        const src2_ = await User.find({ user_id: id })
        if (src_[0].role >= 2 && src2_.length == 1) {
            let link = {
                "user_refere": info.user_refere
            }
            const member_ = await Member.find({ "member_id": info.user_refere })
            if (member_.length >= 1 || info.user_refere == -1) {
                AuthController.isAboveTheUserRole(info.user.user_id, id, (result, exist) => {
                    if (result) {
                        if (info.user_refere == -1) {
                            if(src2_[0].role == 3){
                                UserController.edit_user(res, id, link, "account unlinked successfully")
                            }else{
                                link.role = 0
                                console.log(link)
                                UserController.edit_user(res, id, link, "account unlinked successfully")
                            }
                            
                        } else {
                            let state = member_[0].status.get("state")
                            if (state.toLowerCase() == "teacher") {
                                link.role = 2
                            }else if(state.toLowerCase() == "student"){
                                link.role = 1
                            }
                            
                            UserController.edit_user(res, id, link, "account linked successfully")
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
    }
    // DELETE USER BY ID IN DB
    static delete_user(res, id, info) {
        if (id == -1) {
            User.deleteOne({
                "_id": info.user.user_id
            })
                .then((result) => {
                    res.status(200);
                    res.send({
                        "response": "your account has been deleted",
                        "ok": 1,
                        "data": result
                    })
                })
                .catch((err) => {
                    res.send({
                        "response": err,
                        "ok": 0
                    })
                })
        } else {
            AuthController.isAboveTheUserRole(info.user.user_id, id, (result, exist) => {
                if (!result) {
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
                } else {
                    User.deleteOne({
                        "user_id": id
                    })
                        .then((result) => {
                            res.status(200);
                            res.send({
                                "response": "user has been deleted",
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
            })
        }
    }

}

module.exports = UserController