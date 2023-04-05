require("dotenv").config("../.env");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));
app.use(cors());
//*The express.json() middleware is responsible for parsing the JSON body of incoming requests and adding the parsed data to the req.body object. So if you have a route or middleware function that needs to access the request body as JSON, you need to make sure that express.json() has already been applied to the request before it reaches that function.
app.use(express.json());

//*requires to be descrutured if file path not specific
const { client } = require("./db");
client.connect();

//*displays active port -- moved to server.js due to console.log warnings thrown during testing, even if running on different ports
// app.listen(3000, function () {
//   console.log('CORS-enabled web server listening on port 3000')
// })

// app.use((req, res, next) => {
//     console.log("---------BodyLog START---------");
//     console.log(req.body);
//     console.log("---------BodyLog END---------");

//     next();
// })

// Setup your Middleware and API Router here
const apiRouter = require("./api");
app.use("/api", apiRouter);

module.exports = app;
