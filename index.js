const express = require("express")
const app = require("./app");

const { API_PORT,WEB_PORT } = process.env;
const api_port = process.env.PORT || API_PORT;
const web_port = process.env.PORT || WEB_PORT;

// server listening 


app.listen(api_port, () => {
  console.log(`Server Backend running on port  http://localhost:${api_port}`);
});
// web.listen(web_port,() => {
//   console.log(`Server Frontend running on port http://localhost:${web_port}`);
// });