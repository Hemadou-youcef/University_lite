require("dotenv").config();
require("./config/database").connect();

const app = require("./routes/api")
const web = require("./routes/web")

// Logic goes here

module.exports = app;

