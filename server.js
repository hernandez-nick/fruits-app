const dotenv = require("dotenv"); // require package
dotenv.config(); // Loads the environment variables from .env file

require("./db/connection.js"); // connect to the database

const Fruit = require("./models/fruit.js");
const morgan = require("morgan"); // require morgan package for logging
const express = require('express');

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

// I.ND.U.C.E.S. (RESTful Routes)

// **Index - GET /fruits - get all the fruits and send back a page
// **New - GET /fruits/new - send a form page to create a new fruit
// **Delete - Delete /fruits/:fruitId - delete some fruits based on the param passed
// **Update - PUT /fruits/:fruitId - update some fruits based on the param passwed and req.body
// **Create - POST /fruits - take data from fruits/new form and add a new fruit to the database
// **Edit - GET /fruits/:fruitId/edit - edit a specific fruit
// **Show - GET /fruits/:fruitId - show one specific fruit

// Extra routes not part of RESTful convention:
// Soft Delete - Delete /fruits/:fruitId - delete some fruits based on the param passed, but instead of actually deleting the document, set a isSoftDeleted field to true and filter for that in the index route so it doesn't show up on the index page
// GET /fruits/:fruitId/confirm_delete - show a confirmation page before deleting a fruit


// Index - GET /fruits - get all the fruits and send back a page
app.get("/fruits", async (req, res) => {
  try {
    // Find all the fruits in the database and send them to the index.ejs page as a variable called fruits
    const fruits = await Fruit.find({ isSoftDeleted: { $in: [false, null] } });
    res.render("fruits/index.ejs", {fruits: fruits});
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// New - GET /fruits/new - send a form page to create a new fruit
app.get("/fruits/new", (req, res) => {
  res.render("fruits/new.ejs");
});

// Delete - Delete /fruits/:fruitId - delete some fruits based on the param passed
app.delete("/fruits/:fruitId", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and delete it, then redirect back to the index page
    await Fruit.findByIdAndDelete(req.params.fruitId);
    res.redirect("/fruits");
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// Update - PUT /fruits/:fruitId - update some fruits based on the param passwed and req.body
app.put("/fruits/:fruitId", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and update it with the data from req.body, then redirect back to the index page
    // Handle input checkbox for isReadyToEat - if it's on, set to true, otherwise false
    req.body.isReadyToEat = req.body.isReadyToEat === "on";
    await Fruit.findByIdAndUpdate(req.params.fruitId, req.body);
    res.redirect(`/fruits/${req.params.fruitId}`);
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// Soft Delete - Delete /fruits/:fruitId - delete some fruits based on the param passed
app.delete("/fruits/:fruitId", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and soft delete it, then redirect back to the index page
    await Fruit.findByIdAndUpdate(req.params.fruitId, {isSoftDeleted: true});
    res.redirect("/fruits");
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// Create - POST /fruits - take data from fruits/new form and add a new fruit to the database
app.post("/fruits", async (req, res) => {
  try {
    // Check for an empty name field, if it's empty throw a manual error to be caught by the catch block
    const {name, color, description} = req.body;
    // If I trim the name and color and they are falsy (empty string, null, undefined) then throw an error
    if (!name.trim() || !color.trim()) 
      return res.render("fruits/new.ejs", {
    message: "Name and color fields cannot be empty, please try again",
  })

    if(description && description.length > 100) {
      return res.render("fruits/new.ejs", {
        message: "Description cannot be longer than 100 characters, please try again",
      });
    }

    // Handle input checkbox for isReadyToEat - if it's on, set to true, otherwise false
    req.body.isReadyToEat = req.body.isReadyToEat === "on" ? true : false;
    // Give the form data to the model.create to make a new mongodb document
    await Fruit.create(req.body);
    // Redirect the user back to the index page after creating the new fruit
    res.redirect("/fruits");

  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// GET /fruits/:fruitId/confirm_delete - show a confirmation page before deleting a fruit
app.get("/fruits/:fruitId/confirm_delete", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and send it to the show.ejs page as a variable called fruit
    const foundFruit = await Fruit.findById(req.params.fruitId);
    // If no fruit is found, throw a manual error to be caught by the catch block
    if (!foundFruit) throw new Error("Failed to find that fruit, please click back and try again");

    res.render("fruits/fruit_confirm_delete.ejs", {
      fruit: foundFruit,
    });
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// Edit - GET /fruits/:fruitId/edit - edit a specific fruit
app.get("/fruits/:fruitId/edit", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and send it to the show.ejs page as a variable called fruit
    const foundFruit = await Fruit.findById(req.params.fruitId);
    // If no fruit is found, throw a manual error to be caught by the catch block
    if (!foundFruit) throw new Error("Failed to find that fruit, please click back and try again");

    res.render("fruits/edit.ejs", {
      fruit: foundFruit,
    });
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

// Show - GET /fruits/:fruitId - show one specific fruit
app.get("/fruits/:fruitId", async (req, res) => {
  try {
    // Find the fruit in the database with the id from the url params and send it to the show.ejs page as a variable called fruit
    const foundFruit = await Fruit.findById(req.params.fruitId);
    // If no fruit is found, throw a manual error to be caught by the catch block
    if (!foundFruit) throw new Error("Failed to find that fruit, please click back and try again");

    res.render("fruits/show.ejs", {
      fruit: foundFruit,
      isReadyToEatMessage: foundFruit.isReadyToEat ? `The ${foundFruit.name} is ready to eat!` : `The ${foundFruit.name} is not ready to eat yet!`
    });
  } catch (error) {
    res.render("error.ejs", {message: error.message});
  }
});

app.get("*slug", (req, res) => {
  res.render("error.ejs", {message: "That page does not exist, please click back and try again"});
});






app.listen(3000, () => {
  console.log('Listening on port 3000');
});
