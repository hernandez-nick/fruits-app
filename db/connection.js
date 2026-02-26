const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('error', (err) => console.log("Error connect to mongodb", err.message));
mongoose.connection.on('connected', () => console.log("Connected to database", mongoose.connection.name));