const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema({
    name: String,
    isReadyToEat: Boolean,
    color: String,
    description: {
        type: String,
        maxlength: 100,
        required: true
    },
    isSoftDeleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: true}); // add createdAt and updatedAt fields to the schema

const Fruit = mongoose.model("Fruit", fruitSchema); // create model

module.exports = Fruit; // export model