const db = require('mongoose')
const { Schema, model } = require('mongoose')
const serverSchema = new Schema({
    idTracker: {
        type: Number,
        required: true,
        default: 0,
    },
    ID: {
        type: Number,
        required: true,
        default: 1,
    },
})
const serverModel = module.exports = model('Server', serverSchema);