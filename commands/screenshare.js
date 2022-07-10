const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash command
const { Message, MessageEmbed } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper, used to get player information
const colours = require('../configs/colours.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('screenshare') // actual command
        .setDescription('Freezes a player for screenshare') //What shows up in the list of slash commands under the name
        .addUserOption((option) => // Adds the section for the option and allows it to be pulled easily
        option
            .setName('user')
            .setDescription('The user to freeze')
            .setRequired(true) //If they don't provide it then discord just won't send it
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: true
        });
        let freezerole = interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'frozen')
        let grabbeduser = interaction.channel.guild.members.cache.get((await interaction.options.getUser('user')).id)
        grabbeduser.roles.add(freezerole)
        let frozenEmbed = new MessageEmbed()
            .setTitle(`${grabbeduser.user.tag} Frozen`)
            .setColor(colours.blue_light)
        interaction.editReply({
            ephemeral: false,
            embeds: [frozenEmbed]
        })
    }
};