const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash command
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { Message } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper, used to get player information
const colours = require('../configs/colours.json')
const profileModel = require('../schemas/profile')
const { writeFile } = require('fs')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard') // actual command
        .setDescription('View a leaderboard') //What shows up in the list of slash commands under the name
        .addSubcommand(s =>
            s
                .setName('elo')
                .setDescription('View the Elo Leaderboard')
                .addIntegerOption(opt =>
                    opt
                        .setName('page')
                        .setDescription('The page you want to view')
                        .setRequired(true)
                )
        )
        .addSubcommand(s =>
            s
                .setName('wlr')
                .setDescription('View the WLR Leaderboard')
                .addIntegerOption(opt =>
                    opt
                        .setName('page')
                        .setDescription('The page you want to view')
                        .setRequired(true)
                )
        )
        .addSubcommand(s =>
            s
                .setName('wins')
                .setDescription('View the WLR Leaderboard')
                .addIntegerOption(opt =>
                    opt
                        .setName('page')
                        .setDescription('The page you want to view')
                        .setRequired(true)
                )
        )
        .addSubcommand(s =>
            s
                .setName('ws')
                .setDescription('View the winstreak Leaderboard')
                .addIntegerOption(opt =>
                    opt
                        .setName('page')
                        .setDescription('The page you want to view')
                        .setRequired(true)
                )
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: false
        });
        const optionselected = interaction.options.getSubcommand();
        let mappe = ''
        let funcData = []
        let individualMessage = false
        let embero = ''
        let table = ''
        let row = ''
        let page = interaction.options.getInteger('page')
        
        let pnum = page*10
        switch(optionselected) {
            case 'elo':
                mappe = await profileModel.find();
                mappe = mappe.filter(function(value) {
                    return value.elo>0
                });
                mappe = mappe.sort(function (b, a) {
                    return a.elo - b.elo
                });
                if ((pnum-10)>mappe.length) {
                    let pageEmbed = new MessageEmbed()
                        .setTitle('Incorrect Page Number')
                        .setColor(colours.red_dark)
                        .setDescription('There are not enough entries')
                    return interaction.editReply({
                        ephemeral: true,
                        embeds: [pageEmbed]
                    })
                }
                individualMessage = false
                funcData = []
                
                for (let pos = (pnum-10); pos < pnum && pos<mappe.length; pos++) {
                    funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].elo})
                };
                for (let contu = 0; contu<mappe.length; contu++) {
                    if (mappe[contu].discordid == interaction.user.id) {		//If the user ID is equal to the command requester
                    individualMessage = `You are position **#${contu+1}** on the leaderboard!`	//Set message to display for individual user
                    }
                };
                if (!individualMessage) {individualMessage = `You aren't ranked yet!`}
                table = format(2,funcData,4);
                if (typeof(table) == Array) {interaction.channel.send({content: table})}

                embero = new MessageEmbed()
                    .setTitle('Elo Leaderboard')
                    .setDescription(table+ `\n\n ${individualMessage}`)
                    .setColor(colours.blue_dark)
        
                row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('I Am On Mobile!')
                        .setCustomId('mobileelo')
                )
                interaction.editReply({ 
                    embeds: [embero], 
                    components: [row],
                    ephemeral: false
                })
                break;
            case 'wlr':
                mappe = await profileModel.find();
                mappe = mappe.filter(function(value) {
                    return value.wlr>0
                });
                mappe = mappe.sort(function (b, a) {
                    return a.wlr - b.wlr
                });
                if ((pnum-10)>mappe.length) {
                    let pageEmbed = new MessageEmbed()
                        .setTitle('Incorrect Page Number')
                        .setColor(colours.red_dark)
                        .setDescription('There are not enough entries')
                    return interaction.editReply({
                        ephemeral: true,
                        embeds: [pageEmbed]
                    })
                }
                individualMessage = false
                funcData = []
                for (let pos = 0; pos < 50 && pos<mappe.length; pos++) {
                    funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].wlr})
                };
                for (let contu = 0; contu<mappe.length; contu++) {
                    if (mappe[contu].discordid == interaction.user.id) {		//If the user ID is equal to the command requester
                    individualMessage = `You are position **#${contu+1}** on the leaderboard!`	//Set message to display for individual user
                    }
                };
                if (!individualMessage) {individualMessage = `You aren't ranked yet!`}
                table = format(2,funcData,4);
                if (typeof(table) == Array) {interaction.channel.send({content: table})}
    
                embero = new MessageEmbed()
                    .setTitle('WLR Leaderboard')
                    .setDescription(table+ `\n\n ${individualMessage}`)
                    .setColor(colours.blue_dark)
            
                row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('I Am On Mobile!')
                        .setCustomId('mobilewlr')
                )
                interaction.editReply({ 
                    embeds: [embero], 
                    components: [row],
                    ephemeral: false
                })
                break;
            case 'wins':
                mappe = await profileModel.find();
                mappe = mappe.filter(function(value) {
                    return value.wins>0
                });
                mappe = mappe.sort(function (b, a) {
                    return a.wins - b.wins
                });
                if ((pnum-10)>mappe.length) {
                    let pageEmbed = new MessageEmbed()
                        .setTitle('Incorrect Page Number')
                        .setColor(colours.red_dark)
                        .setDescription('There are not enough entries')
                    return interaction.editReply({
                        ephemeral: true,
                        embeds: [pageEmbed]
                    })
                }
                individualMessage = false
                funcData = []
                for (let pos = 0; pos < 50 && pos<mappe.length; pos++) {
                    funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].wins})
                };
                for (let contu = 0; contu<mappe.length; contu++) {
                    if (mappe[contu].discordid == interaction.user.id) {		//If the user ID is equal to the command requester
                    individualMessage = `You are position **#${contu+1}** on the leaderboard!`	//Set message to display for individual user
                    }
                };
                if (!individualMessage) {individualMessage = `You aren't ranked yet!`}
                table = format(2,funcData,4);
                if (typeof(table) == Array) {interaction.channel.send({content: table})}
    
                embero = new MessageEmbed()
                    .setTitle('Wins Leaderboard')
                    .setDescription(table+ `\n\n ${individualMessage}`)
                    .setColor(colours.blue_dark)
            
                row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('I Am On Mobile!')
                        .setCustomId('mobilewins')
                )
                interaction.editReply({ 
                    embeds: [embero], 
                    components: [row],
                    ephemeral: false
                })
                break;
            case 'ws':
                mappe = await profileModel.find();
                mappe = mappe.sort(function (b, a) {
                    return a.ws - b.ws
                });
                if ((pnum-10)>mappe.length) {
                    let pageEmbed = new MessageEmbed()
                        .setTitle('Incorrect Page Number')
                        .setColor(colours.red_dark)
                        .setDescription('There are not enough entries')
                    return interaction.editReply({
                        ephemeral: true,
                        embeds: [pageEmbed]
                    })
                }
                individualMessage = false
                funcData = []
                for (let pos = 0; pos < 50 && pos<mappe.length; pos++) {
                    funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].ws})
                };
                for (let contu = 0; contu<mappe.length; contu++) {
                    if (mappe[contu].discordid == interaction.user.id) {		//If the user ID is equal to the command requester
                    individualMessage = `You are position **#${contu+1}** on the leaderboard!`	//Set message to display for individual user
                    }
                };
                if (!individualMessage) {individualMessage = `You aren't ranked yet!`}
                table = format(2,funcData,4);
                if (typeof(table) == Array) {interaction.channel.send({content: table})}

                embero = new MessageEmbed()
                    .setTitle('Winstreak Leaderboard')
                    .setDescription(table+ `\n\n ${individualMessage}`)
                    .setColor(colours.blue_dark)
        
                row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('I Am On Mobile!')
                        .setCustomId('mobilews')
                )
                interaction.editReply({ 
                    embeds: [embero], 
                    components: [row],
                    ephemeral: false
                })
                break;
        }
        
    },
};

function format(columns,data,coulumnSpacing) { //columns == an int, data == [{},{},{},...]
	let output = ""
    let arrOfColumns = []
	let arrOfStrings = []
    let spacing = ""
    let maxLength = 0
    for (let i = 0; i < coulumnSpacing; i++) { spacing += " "}
	let splitPoint = Math.floor(data.length/columns)
	for (let i = 0; i < data.length; i++) {
        var content = `#${i+1}: ${data[i].uName} - ${data[i].uWins}`
        if (content.length > maxLength) { maxLength = content.length}
		arrOfStrings.push(content)
	}
    for (let i = 0; i < arrOfStrings.length; i++) {
        var currentLength = arrOfStrings[i].length
        var lengthChange = maxLength - currentLength
        
        if (lengthChange < 0) {return ["Error: Could Not Calculate Padding Length - Length is negative"]}
        var charactersChange = ""
        for (let j = 0; j <= lengthChange; j++) {
            charactersChange += " "
        }
        
        arrOfStrings[i]+=charactersChange
    }
	for (let i = 0; i <columns; i++ ) {
		arrOfColumns.push(arrOfStrings.slice(splitPoint*i,splitPoint*(i+1)))
	}
    
    for (let i = 0; i < splitPoint; i++) {
        for (let j = 0; j < columns; j++) {
            output += `\`${arrOfColumns[j][i]}\``
            output += spacing
        }
        output += "\n"
    }
    return output
}

async function switcher(optionselected) {
    let whichlb = ''
    switch(optionselected) {
        case 'elo':
            whichlb = 'elo'
            vis = 'Elo'
            break;
        case 'wins':
            whichlb = 'wins'
            vis = 'Wins'
            break;
        case 'wlr':
            whichlb = 'wlr'
            vis = 'WLR'
            break;
        case 'ws':
            whichlb = 'ws'
            vis = 'Winstreak'
            break;
    };
}