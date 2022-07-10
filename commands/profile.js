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
        .setName('profile') // actual command
        .setDescription('view your profile or another users') //What shows up in the list of slash commands under the name
        .addUserOption((option) => // Adds the section for the option and allows it to be pulled easily
        option
            .setName('member')
            .setDescription('Who\'s profile to check')
            .setRequired(false) //If they don't provide it then discord just won't send it
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: false
        });
        let optionuser = await interaction.options.getUser('member')
        if (!optionuser) {
            let foundProfile = await profileModel.findOne({ discordid: interaction.user.id });
            if (!foundProfile) {
                let unregisteredembed = new MessageEmbed()
                    .setTitle('You Are Not Registered!')
                    .setDescription('Do /register To Register For PikaRBW')
                    .setColor(colours.delete_red)
                return interaction.editReply({
                    ephemeral: false,
                    embeds: [unregisteredembed]
                })
            }
            let gp = foundProfile.wins + foundProfile.losses
            let wlr = (foundProfile.wins/foundProfile.losses).toFixed(2)
            let profileEmbed = await new MessageEmbed()
                .setTitle(`${foundProfile.ign}'s Stats`)
                .setDescription(`Discord: <@${interaction.user.id}>`)
                .addFields(
                    { name: 'Games Played', value: `${gp}`, inline: true },
                    { name: 'Wins', value: `${foundProfile.wins}`, inline: true },
                    { name: 'Losses', value: `${foundProfile.losses}`, inline: true },
                    { name: 'Winstreak', value: `${foundProfile.ws}`, inline: true },
                    { name: 'Losestreak', value: `${foundProfile.ls}`, inline: true },
                    { name: 'WLR', value: `${wlr}`, inline: true },
                    { name: 'Division', value: `${foundProfile.division}`, inline: true },
                    { name: 'Elo', value: `${foundProfile.elo}`, inline: true },
                    { name: 'Last Updated', value: `<t:${foundProfile.lastupdated}>`, inline: true}
                )
                .setColor('BLURPLE')
            console.log(foundProfile.lastupdated)
            interaction.editReply({
                ephemeral: false,
                embeds: [profileEmbed]
            })
        }
        else {
            let foundProfile = await profileModel.findOne({ discordid: optionuser.id });
            if (!foundProfile) {
                let unregisteredembed = new MessageEmbed()
                    .setTitle('They Are Not Registered!')
                    .setDescription('They Must /register For Pika RBW')
                    .setColor(colours.delete_red)
                return interaction.editReply({
                    ephemeral: false,
                    embeds: [unregisteredembed]
                })
            }
            let gp = foundProfile.wins + foundProfile.losses
            let wlr = (foundProfile.wins/foundProfile.losses).toFixed(2)
            let profileEmbed = await new MessageEmbed()
                .setTitle(`${foundProfile.ign}'s Stats`)
                .setDescription(`Discord: <@${optionuser.id}>`)
                .addFields(
                    { name: 'Games Played', value: `${gp}`, inline: true },
                    { name: 'Wins', value: `${foundProfile.wins}`, inline: true },
                    { name: 'Losses', value: `${foundProfile.losses}`, inline: true },
                    { name: 'Winstreak', value: `${foundProfile.ws}`, inline: true },
                    { name: 'Losestreak', value: `${foundProfile.ls}`, inline: true },
                    { name: 'WLR', value: `${wlr}`, inline: true },
                    { name: 'Division', value: `${foundProfile.division}`, inline: true },
                    { name: 'Elo', value: `${foundProfile.elo}`, inline: true },
                    { name: 'Last Updated', value: `<t:${foundProfile.lastupdated}>`, inline: true}
                )
                .setColor('BLURPLE')
            console.log(foundProfile.lastupdated)
            interaction.editReply({
                ephemeral: false,
                embeds: [profileEmbed]
            })
        }
    }
}