const express = require("express")
const path = require("path")


module.exports = function (web) { 
    web.engine('.ejs', require('ejs').__express); 
    web.set('views', __dirname + '\\..\\views');
    web.use(express.static(path.join(__dirname + "\\..\\public" )))
    web.use(express.static(path.join(__dirname + "\\..\\resources" )))

    web.get("/",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('index.ejs');
    })
    web.get("/profile",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('profile.ejs');
    })
    web.get("/users",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('users.ejs');
    })
    web.get("/members",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('members.ejs');
    })
    web.get("/marks",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('marks.ejs');
    })
    web.get("/complaints",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('complaints.ejs');
    })
    web.get("/complaint/:id",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('complaint.ejs',{
            id: req.params.id
        });
    })
    web.get("/login",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('login.ejs',{
            id: req.params.id
        });
    })
    web.get("/register",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('register.ejs',{
            id: req.params.id
        });
    })
    web.get("/About-us",(req,res)=>{
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('about-us.ejs',{
            id: req.params.id
        });
    })
    
    // web.get("/",(req,res)=>{
    //     res.setHeader('Content-Type', 'text/html');
    //     res.status(200).sendFile(path.join(__dirname+"\\..\\views\\home.html"));
        
    // })
    
    web.use((req,res)=>{
        res.status(404).render('404.ejs',{
            "NOT_FOUND_URL" : req.url
        });
    })
    return web
};