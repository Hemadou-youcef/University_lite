require("dotenv").config();
require("./config/database").connect();

var app = require("./routes/api")
const web = require("./routes/web")

app = web(app)
// Logic goes here

module.exports = app;

