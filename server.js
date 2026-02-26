const dotenv = require("dotenv"); // require package
dotenv.config(); // Loads the environment variables from .env file

require("./db/connection.js"); // connect to the database

const Fruit = require("./models/fruit.js");

const express = require('express');

const app = express();


app.use(express.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(express.json()); // for parsing application/json

// Routes
// Landing Page
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// I.ND.U.C.E.S. (RESTful Routes)

// **Index - GET /fruits - get all the fruits and send back a page
// **New - GET /fruits/new - send a form page to create a new fruit
// Delete - Delete /fruits/:fruitId - delete some fruits based on the param passed
// Update - PUT /fruits/:fruitId - update some fruits based on the param passwed and req.body
// **Create - POST /fruits - take data from fruits/new form and add a new fruit to the database
// Edit - GET /fruits/:fruitId/edit - edit a specific fruit
// **Show - GET /fruits/:fruitId - show one specific fruit



// Index - GET /fruits - get all the fruits and send back a page
app.get("/fruits", async (req, res) => {
  try {
    // Find all the fruits in the database and send them to the index.ejs page as a variable called fruits
    const fruits = await Fruit.find({});
    res.render("fruits/index.ejs", {fruits: fruits});
  } catch (error) {
    res.json({err: error.message});
  }
});

// New - GET /fruits/new - send a form page to create a new fruit
app.get("/fruits/new", (req, res) => {
  res.render("fruits/new.ejs");
});

// Create - POST /fruits - take data from fruits/new form and add a new fruit to the database
app.post("/fruits", async (req, res) => {
  try {
    // Check for an empty name field, if it's empty throw a manual error to be caught by the catch block
    const {name, color} = req.body;
    // If I trim the name and color and they are falsy (empty string, null, undefined) then throw an error
    if (!name.trim() || !color.trim()) 
      throw new Error("Name and color are required fields, please click back and try again");
    // Handle input checkbox for isReadyToEat - if it's on, set to true, otherwise false
    req.body.isReadyToEat = req.body.isReadyToEat === "on" ? true : false;
    // Give the form data to the model.create to make a new mongodb document
    await Fruit.create(req.body);
    // Redirect the user back to the index page after creating the new fruit
    res.redirect("/fruits");

  } catch (error) {
    res.json({err: error.message});
  }
});


// Show - GET /fruits/:fruitId - show one specific fruit
app.get("/fruits/:fruitId", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and send it to the show.ejs page as a variable called fruit
    const foundFruit = await Fruit.findById(req.params.fruitId);
    // If no fruit is found, throw a manual error to be caught by the catch block
    if (!foundFruit) throw new Error("Failed to find that fruit, please click back and try again");
    res.json(foundFruit);
  } catch (error) {
    res.json({err: error.message});
  }
});








app.listen(3000, () => {
  console.log('Listening on port 3000');
});
