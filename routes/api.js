const express = require("express")
const parser = require("body-parser")

// CONTROLLER REQUIRE LIST
const user_controller = require("./../controllers/UserController")
const member_controller = require("./../controllers/MemberController")
const complaint_controller = require("./../controllers/ComplaintController")

//MIDDLEWARE
const auth = require("./../middleware/auth");

const app = express()
app.use(parser.urlencoded({ extended: true }))
app.use(parser.json())




// // CONNECT URL TO MONGODB
// const mongoURL = "mongodb://127.0.0.1:27017/University" 
// mongoose.connect(mongoURL).then((result)=>{
//         console.log("Connected successfully")
//         app.listen(14683);
//     }).catch((err)=>{
//         console.log(err)
//     })



/*
    ADMIN - CURRENT USER
    /api/user -> GET USER INFO | GET
    /api/register -> ADD USER | POST
    /api/user/:id -> EDIT USER | PUT
    /api/user/:id -> DETETE USER BY ID | DELETE---

    admin-teacher-student
    /api/pv/:id -> GET PV | GET
    /api/complaints/student/:id -> GET COMPLAINTS BY STUDENTS ID | POST
    /api/complaints/:id -> // DELETE COMPLAINTS BY ID | DELETE

    student
    /api/complaints -> ADD COMPLAINTS | POST

    admin-teacher
    /api/mark/:subject/:id -> SHOW MARK BY SUBJECT ID AND STUDENTS ID | GET
    /api/mark/:subject/:id -> ADD MARK BY SUBJECT ID AND STUDENTS ID | POST
    /api/mark/:id -> EDIT MARK BY ID | PUT
    /api/mark/:id -> DELETE MARK BY ID | DELETE

    admin
    /api/student/:id -> SHOW STUDENTS INFO | GET
    /api/student -> ADD STUDENTS | POST
    /api/student/:id -> EDIT STUDENTS BY ID | PUT
    /api/student/:id-> DELETE STUDENTS BY ID | DELETE

    /api/teacher/:id -> SHOW TEACHER INFO | GET
    /api/teacher -> ADD TEACHER | POST
    /api/teacher/:id -> EDIT TEACHER BY ID | PUT
    /api/teacher/:id-> DELETE TEACHER BY ID | DELETE

*/

// PV FUNCTIONS
app.get("/api/pv/:id",auth ,(req,res)=>{
    // GET PV
    res.send({
        "response":"Sorry you don't have access, that all we know"
    })
})
// MARK FUNCTIONS
app.get("/api/mark/:id/:year/:season/:subject",auth ,(req,res)=>{
    // SHOW MARK BY SUBJECT
    member_controller.get_mark(res,req.body,req.params.id,req.params.year,req.params.season,req.params.subject)
})

app.post("/api/mark",auth ,(req,res)=>{
    // ADD MARK BY STUDENTS ID
    member_controller.add_mark(res,req.body)
})
app.put("/api/mark/:id",auth ,(req,res)=>{
    // EDIT MARK BY USER ID
    member_controller.edit_mark(res,req.params.id,req.body)
})
app.delete("/api/mark/:id",auth ,(req,res)=>{
    // DELETE MARK BY ID
    member_controller.delete_mark(res,req.params.id,req.body)
})

// COMPLAINTS FUNCIOTN
app.get("/api/complaints/:id/:from",auth ,(req,res)=>{
    // SHOW MARK BY SUBJECT
    complaint_controller.show_complaint(res,req.params.id,req.params.from,req.body)
})
app.post("/api/complaints",auth ,(req,res)=>{
    // ADD COMPLAINTS
    complaint_controller.add_complaint(res,req.body)
})
app.post("/api/complaints/reply",auth ,(req,res)=>{
    // ADD COMPLAINTS REPLY
    complaint_controller.add_reply(res,req.body)
})
app.put("/api/complaints/:id",auth ,(req,res)=>{
    // GET COMPLAINTS BY STUDENTS ID
    complaint_controller.edit_complaint(res,req.params.id,req.body)
})
app.delete("/api/complaints/:id",auth ,(req,res)=>{
    // DELETE COMPLAINTS BY ID
    complaint_controller.delete_complaint(res,req.params.id,req.body)
})


app.get("/api/member/:id",auth ,(req,res)=>{
    // SHOW STUDENTS INFO
    member_controller.show_member(res,req.params.id,"member",req.body)
})

// STUDENTS FUNCTIONS
app.get("/api/student/:id",auth ,(req,res)=>{
    // SHOW STUDENTS INFO
    member_controller.show_member(res,req.params.id,"student",req.body)
})
app.post("/api/student",auth ,(req,res)=>{
    // ADD STUDENTS
    req.body.status = {
        "state":"student",
        "years" : req.body.year,
        "specialty" : req.body.specialty,
        "department" : req.body.department,
    }
    req.body.marks = [
        {"year":"l1","s1":[],"s2":[]},
        {"year":"l2","s1":[],"s2":[]},
        {"year":"l3","s1":[],"s2":[]},
        {"year":"m1","s1":[],"s2":[]},
        {"year":"m2","s1":[],"s2":[]}
    ]
    member_controller.add_member(res,req.body)
})
app.put("/api/student/:id",auth ,(req,res)=>{
    // EDIT STUDENTS BY ID
    member_controller.edit_member(res,req.params.id,req.body)
})
app.delete("/api/student/:id",auth ,(req,res)=>{
    // DELETE STUDENTS BY ID
    member_controller.delete_member(res,req.params.id,req.body)
})

// TEACHERS FUNCTIONS
app.get("/api/teacher/:id",auth ,(req,res)=>{
    // SHOW TEACHERS INFO
    member_controller.show_member(res,req.params.id,"teacher",req.body)
})
app.post("/api/teacher",auth ,(req,res)=>{
    // ADD TEACHERS
    req.body.status = {
        "state":"teacher",
        "years" : req.body.year,
        "subject" : req.body.subject,
        "department" : req.body.department,
    }

    member_controller.add_member(res,req.body)
})
app.put("/api/teacher/:id",auth ,(req,res)=>{
    // EDIT TEACHERS BY ID
    member_controller.edit_member(res,req.params.id,req.body)
})
app.delete("/api/teacher/:id",auth ,(req,res)=>{
    // DELETE TEACHERS BY ID
    member_controller.delete_member(res,req.params.id,req.body)
})


app.get("/api/member/me",auth ,(req,res)=>{
    // DELETE TEACHERS BY ID
    member_controller.show_member(res,"me","teacher",req.body)
})

// USER FUNCTIONS
app.get("/api/user/:id",auth ,(req,res)=>{
    // SHOW USER BY ID
    user_controller.show_users(res,req.params.id,req.body)
})
app.put("/api/link/:id",auth ,(req,res)=>{
    // EDIT USER BY ID
    user_controller.link_account(res,req.params.id,req.body)
})
app.put("/api/grant/:id",auth ,(req,res)=>{
    // EDIT USER BY ID
    user_controller.grant_permission(res,req.params.id,req.body)
})
app.delete("/api/user/:id",auth ,(req,res)=>{
    // DELETE USER BY ID
    user_controller.delete_user(res,req.params.id,req.body)
})

app.post("/api/register",(req,res)=>{
    // ADD USER BY ID
    user_controller.register(res,req.body)
})

app.post("/api/login",(req,res)=>{
    // ADD USER BY ID
    user_controller.login(res,req.body)
})



// NO REGISTERED API
// app.use((req,res)=>{
//     // 404 NOT FOUND
//     res.status(404)
//     res.send({
//         "response":"Sorry you don't have access, that all we know"
//     })
// })

module.exports = app;