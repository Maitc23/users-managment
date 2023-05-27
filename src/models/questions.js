const { Schema, model } = require('mongoose');

//Model for notes 
const notesSchema = new Schema({
    title: String,
    content: {
        type: String,
    },
    response: {
        type: String,
    }
},
    {
        timestamps: true
    });

module.exports = model('questions', notesSchema);