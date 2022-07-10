const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash command
const { Message, MessageEmbed } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper, used to get player information
const colours = require('../configs/colours.json')
const profileModel = require('../schemas/profile')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('strike') // actual command
        .setDescription('Strike A Player') //What shows up in the list of slash commands under the name
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user being striked')
                .setRequired(true)
        )
        .addStringOption((option) => // Adds the section for the option and allows it to be pulled easily
            option
                .setName('reason')
                .setDescription('The reason for the strike')
                .setRequired(true) //If they don't provide it then discord just won't send it
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: true
        });
        /*
        1. Reason - By tag
        */
        const reasongiven = interaction.options.getString('reason')
        const usergiven = interaction.options.getUser('user')
        let profc = await profileModel.findOne({ discordid: usergiven.id })
        if (!profc) {
           let newProfile = await new profileModel({
               discordid: usergiven.id
           }).save()
        };
        let prof = await profileModel.findOne({ discordid: usergiven.id })
        let newstrike = 'Reason: ' + reasongiven + ` - Given By ${interaction.user.tag}`
        let currentarray = prof.strikes
        await currentarray.push(newstrike)
        console.log(currentarray)
        let profUpdate = await profileModel.findOneAndUpdate({ discordid: usergiven.id }, { strikes: currentarray })
        let strikeEmbed = new MessageEmbed()
            .setTitle(`${usergiven.tag} Stricken`)
            .setDescription(newstrike)
            .setColor(colours.red_dark)
        interaction.editReply({
            ephemeral: true,
            embeds: [strikeEmbed]
        })

    }
}