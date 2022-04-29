const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  if (localStorage.getItem("token") === null) {
      window.location.href = '/login'
  } else {
    return next();
  }
    
    
};

module.exports = verifyToken;