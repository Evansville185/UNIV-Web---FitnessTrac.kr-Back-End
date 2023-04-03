require("dotenv").config('../.env');
const express = require("express");
const app = express();
const morgan = require('morgan');
const cors = require('cors');

app.use(morgan('dev'));
app.use(cors())
//*The express.json() middleware is responsible for parsing the JSON body of incoming requests and adding the parsed data to the req.body object. So if you have a route or middleware function that needs to access the request body as JSON, you need to make sure that express.json() has already been applied to the request before it reaches that function.
app.use(express.json());

//*requires to be descrutured if file path not specific
const { client } = require('./db');
client.connect();

//*displays active port
app.listen(function () {
    console.log('CORS-enabled web server listening on port 3000')
  })

// app.use((req, res, next) => {
//     console.log("---------BodyLog START---------");
//     console.log(req.body);
//     console.log("---------BodyLog END---------");

//     next();
// })

// Setup your Middleware and API Router here
const apiRouter = require('./api');
app.use('/api', apiRouter);


module.exports = app;

/*
1.Load environment variables from .env file (optional)
2.Create an instance of Express and define the app variable
3.Load the morgan and cors middleware functions
4.Load the express.json() middleware function to parse the JSON body of incoming requests
5.Connect to the database using the client object
6.Start the server and listen on port 80
7.Load the API routes using the apiRouter
8.Export the app object for use in other modules
This order is generally good practice, because it ensures that the middleware functions are applied before any routes or API handlers are defined. Additionally, the cors middleware function is loaded before the express.json() middleware function, which is important because cors can modify the request headers and it's best to apply it first.
*/