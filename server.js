const dotenv = require("dotenv"); // require package
dotenv.config(); // Loads the environment variables from .env file

require("./db/connection.js"); // connect to the database

const Fruit = require("./models/fruit.js");
const morgan = require("morgan"); // require morgan package for logging
const express = require('express');
const fruitsController = require("./controllers/fruit.controller.js"); // require the fruits controller to use the routes defined in it
const app = express();

const methodOverride = require("method-override");
app.use(methodOverride("_method")); // override with POST having ?_method=DELETE or ?_method=PUT

app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(express.json()); // for parsing application/json
app.use(morgan("tiny")); // log every request to the console
app.use(express.static("public")); // serve static files from the public folder

// Routes
// Landing Page
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.use(fruitsController); // use the fruits controller for all routes starting with /fruits

app.get("*slug", (req, res) => {
  res.render("error.ejs", {message: "That page does not exist, please click back and try again"});
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
