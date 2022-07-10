const db = require('mongoose')
const { Schema, model } = require('mongoose')
const gameSchema = new Schema({
    gameId: {
        type: String,
        required: true,
        default: 0
    },
    channelId: {
        type: String,
        required: false
    },
    players: {
        type: Array,
        required: false
    },
    blueTeam: {
        type: Array,
        required: false
    },
    redTeam: {
        type: Array,
        required: false
    },
    scorer: {
        type: String,
        required: false,
    },
    redVcId: {
        type: String,
        required: true,
    },
    blueVcId: {
        type: String,
        required: true
    }
})
const gameModel = module.exports = model('Games', gameSchema)