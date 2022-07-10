const db = require('mongoose')
const { Schema, model } = require('mongoose')
const playerSchema = new Schema({
    ign: {
        type: String,
        required: false,
    },
    discordid: {
        type: Number,
        required: true
    },
    games: {
        type: Number,
        required: true,
        default: 0,
    },
    wins: {
        type: Number,
        required: true,
        default: 0,
    },
    losses: {
        required: true,
        type: Number,
        default: 0,
    }, 
    elo: {
        type: Number,
        required: true,
        default: 0,
    },
    lastupdated: {
        type: String,
        required: true,
        default: 'None Given'
    },
    division: {
        type: String,
        required: true,
        default: 'Coal'
    },
    ingame: {
        type: Boolean,
        required: true,
        default: false
    },
    wlr: {
        type: Number,
        required: true,
        default: 0
    },
    ws: {
        type: Number,
        required: true,
        default: 0
    },
    ls: {
        type: Number,
        required: true,
        default: 0
    },
    strikes: {
        type: Array,
        required: true,
        default: []
    }
})
const profileModel = module.exports = model('Players', playerSchema)