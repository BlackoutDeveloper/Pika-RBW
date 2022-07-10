const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash command
const { Message, MessageEmbed } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper
const profileModel = require('../schemas/profile')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('infractions') // actual command
        .setDescription('Check the infractions of a user') //What shows up in the list of slash commands under the name
        .addUserOption((option) => // Adds the section for the option and allows it to be pulled easily
        option
            .setName('user')
            .setDescription('The user to check the infractions of')
            .setRequired(true) //If they don't provide it then discord just won't send it
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: false
        });
        let user = interaction.options.getUser('user')
        let prof = await profileModel.findOne({ discordid: user.id})
        if (!prof) {
            let profEmbed = new MessageEmbed()
                .setTitle('That User Is Not Registered')
                .setColor('DARK_RED')
            interaction.editReply({
                ephemeral: false,
                embeds: [profEmbed]
            });
        };
        let strikeString = ''
        let strikeArray = prof.strikes
        let strikeCount = 0
        if (prof.strikes.length == 0) {
            strikeString = '**No Strikes Found**';
        } else {
            await Promise.all(strikeArray.map(async(i) => {
                strikeCount += 1
                strikeString += `**${strikeCount}.** ${i} \n`
            }));
        };
        let strikesEmbed = new MessageEmbed()
            .setTitle(`${user.tag}'s Strikes`)
            .setDescription(`${strikeString}`)
            .setColor('DARK_ORANGE')
        interaction.editReply({
            ephemeral: false,
            embeds: [strikesEmbed]
        })
    }
}