const express = require("express")
var parser = require('body-parser');

const app = express()

app.listen(80);
app.engine('.ejs', require('ejs').__express); 
app.set('views', __dirname + '\\..\\views');



app.get("/",(req,res)=>{
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('home.ejs',{
        "first-name" : "youcef",
        "second-name" : "hemadou"
    });
})

app.use((req,res)=>{
    res.status(404).render('404.ejs',{
        "NOT_FOUND_URL" : req.url
    });
})