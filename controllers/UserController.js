const User = require("./../models/user")
const Member = require("./../models/member")

// CONTROLLERS
const CounterController = require("./CounterController")


class UserController {
    // SHOW USERS BY ID IN DB
    static show_users(res,id){
        let query = {}
        if(id != -1)
            query = {"user_id":id}
        const all = User.find(query,(err, users)=>{
            var userMap = [];
            users.forEach((user,index)=>{
                userMap[index] = {
                    "user_id" : user.user_id,
                    "user name" : user.user_name,
                    "user refere" : user.user_refere
                };
            });
            if (userMap.length == 0){
                res.status(204)
                res.send({
                    "response":"no user found"
                });
            }else{
                res.status(200)
                res.send(userMap);
            }
              
        })
    }

    // ADD USER IN DB
    static add_user(res,info){
        CounterController.get_counter("user_counter",true,(index)=>{
            const user = new User({
                user_id:index,
                user_name : info.user_name,
                user_pass : info.user_pass,
                user_refere : info.user_refere,
                role : 0
            })
            CounterController.inc_counter({"user_counter":index},{"user_counter":(index + 1)},()=>{
                user.save().then((result) => {
                    
                    res.status(201);
                    res.send({
                        "response":"user has been added",
                        "ok":1,
                        "data":result
                    })
                })
                .catch((err) => {
                    CounterController.inc_counter({"user_counter":index},{"user_counter":(index - 1)},()=>{
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

    // EDIT USER BY ID IN DB
    static edit_user(res,id,info){ 
        User.updateOne({
                "user_id":id
            },info)
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"user has been edited",
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

    // DELETE USER BY ID IN DB
    static delete_user(res,id){
        User.deleteOne({
                "user_id":id
            })
            .then((result) => {
                res.status(200);
                res.send({
                    "response":"user has been deleted",
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

    static check_permission(source,destination){
        let src = {"user_id":source}
        let dest = {"user_id":destination}
        let src_role = 0;
        let dest_role = 0;
        User.find(src,(err, users)=>{
            users.forEach(function(user,index) {
                src_role = user.role
            });             
        })
        User.find(dest,(err, users)=>{
            users.forEach(function(user,index) {
                dest_role = user.role
            });             
        })
        if(src_role > dest_role || src_role == 3){
            return true
        }
        return false
    }
}

module.exports = UserController