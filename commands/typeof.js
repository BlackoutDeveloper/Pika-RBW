const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash command
const { Message } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const { Permissions } = require('discord.js')
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper, used to get player information
module.exports = {
    data: new SlashCommandBuilder()
        .setName('typeof') // actual command
        .setDescription('typeof') //What shows up in the list of slash commands under the name
        .addChannelOption((option) => // Adds the section for the option and allows it to be pulled easily
        option
            .setName('chanel')
            .setDescription('Le channel')
            .setRequired(true) //If they don't provide it then discord just won't send it
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: true
        });
        const testChannel = await interaction.guild.channels.create(`forum`, {
            type: 'GUILD_FORUM',
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES],
                },
            ],
        }).catch(err => console.log(`Game Channel Creation - Error Occured: ${err}`))
        testChannel.setParent(interaction.options.getChannel('chanel'))
    }
}