const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash command
const { Message } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const profileModel = require('../schemas/profile') // What actually allows new player profiles to be made 
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper, used to get player information
module.exports = {
    data: new SlashCommandBuilder()
        .setName('register') // so its /register
        .setDescription('Register for Ranked Bedwars!') //What shows up in the list of slash commands under /register
        .addStringOption((option) => // Adds the section for the username and allows it to be pulled easily
        option
            .setName('username')
            .setDescription('The Username You Want To Register For RBW')
            .setRequired(true) //If they don't provide it then discord just won't send it
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: true
        });
        const alreadyverifiedcheck = await profileModel.findOne({ discordid: interaction.user.id}); // Checks if they have previously verified
        if (alreadyverifiedcheck) return interaction.editReply({
            content: 'You are already verified! If you have changed your ign and need to update it, use `/setign` to update your account.',
            ephemeral: true,
        }); //Stops creating a second profile
        const playerusername = interaction.options.getString('username'); // Assigns the username to a variable for ease of use
        const discorduser = interaction.guild.members.cache.get(interaction.user.id);
        const profileUpdate = new profileModel({
            ign: playerusername,
            discordid: interaction.user.id,
            games: 0,
            wins: 0,
            losses: 0,
            elo: 0,
            wlr: 0,
            lastupdated: String(parseInt((new Date().getTime() / 1000).toFixed(0))),
            division: 'Coal',
            ingame: false
        }).save() //Whilst all but ign, uuid and discordid are the defaults, do not modify in case something changes in the schema (../../schemas/player.js)
        discorduser.setNickname(`[0]${playerusername}`)
        return interaction.editReply({
            content: `Verified as \`${playerusername}\`!`,
            ephemeral: true
        });
    }
}