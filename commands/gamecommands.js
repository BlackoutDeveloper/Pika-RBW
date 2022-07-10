const { SlashCommandBuilder } = require('@discordjs/builders') // Allows command to be a slash 
const { Message, MessageEmbed } = require('discord.js') // Discord api integration, unnecessary but I don't feel like removing it ;)
const mongoose = require('mongoose') // Unnecessary but just in case theres something up with the database, might as well have it ready
const profileModel = require('../schemas/profile') // What actually allows new player profiles to be made 
const maca = require('mcdata') // Api that checks the username actually links to an account
const mcp = require('minecraft-player') // UUID converter
const apit = require('@zikeji/hypixel') // Hypixel API wrapper, really useful
const clementine = new apit.Client("d1288f02-a6f1-4765-99ff-82b327026d2e") // The client of the api wrapper, used to get player information
const moment = require('moment')
const channels = require('../configs/channels.json')
const colours = require('../configs/colours.json')
const gameModel = require('../schemas/game')
const { unix } = require('moment')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('game') // actual command
        .setDescription('Set the score of a ranked game') //What shows up in the list of slash commands under the namen
        .addSubcommand(s =>
            s
                .setName('score')
                .setDescription('Score the game')
                .addStringOption((opt) =>
                    opt
                        .setName('winner')
                        .setDescription('The Winning Team')
                        .setRequired(true)
                )
        )
        .addSubcommand(s =>
            s
                .setName('void')
                .setDescription('Void the game')
                .addStringOption((opt) =>
                opt
                    .setName('reason')
                    .setDescription('Why is it voided')
                    .setRequired(true)
                )
        ),
    async execute(interaction) { // the code that is executed
        await interaction.deferReply({
            ephemeral: true
        });
        
        
        const optionselected = interaction.options.getSubcommand();
        if (optionselected === 'score') {
            if (interaction.channel.parentId !== channels.gamescategory) {
                let wrongchannelembed = new MessageEmbed()
                    .setTitle('Incorrect Channel')
                    .setDescription('Only do this command in game channels in order to score the game.')
                    .setColor(colours.rww)
                return interaction.editReply({
                    embeds: [wrongchannelembed],
                    ephemeral: true
                })
            };
            const foundUser = interaction.guild.members.cache.get(interaction.user.id);
            const scorerCheck = foundUser.roles.cache.find(r => r.name.toLowerCase() === 'scorer')
            if (!scorerCheck) {
                let wrongroleembed = new MessageEmbed()
                    .setTitle('You Do Not Have Permission!')
                    .setDescription('You are not a scorer!')
                    .setColor(colours.rww)
                return interaction.editReply({
                    embeds: [wrongroleembed],
                    ephemeral: true,
                });
            };
            let redscore = 0
            let bluescore = 0
            const winner = await (interaction.options.getString('winner')).toLowerCase();
            switch(winner) {
                case '2':
                    redscore = 2
                    bluescore = 1
                    break;
                case '1':
                    redscore = 1
                    bluescore = 2
                    break;
                default:
                    let wrongentryembed = new MessageEmbed()
                        .setTitle('Incorrect Format')
                        .setDescription('Either put 1 or 2 as the winner.')
                        .setColor(colours.rww)
                    return interaction.editReply({
                        embeds: [wrongentryembed],
                        ephemeral: true,
                    });
            }
            
            const channelname = interaction.channel.name;
            const stringedchannelname = String(channelname);
            const gameid = stringedchannelname.substring(stringedchannelname.length-5);
            let gamescoreupdate = await gameModel.findOneAndUpdate({ gameId: gameid }, { redScore: redscore, blueScore: bluescore, scorer: interaction.user.tag });
            let game = await gameModel.findOne({ gameId: gameid });
            let redvcid = game.redVcId
            let bluevcid = game.blueVcId
            let redVc = await interaction.channel.guild.channels.fetch(`${redvcid}`)
            let blueVc = await interaction.channel.guild.channels.fetch(`${bluevcid}`)
            let redteam = game.redTeam;
            let blueteam = game.blueTeam;
            let increase = 0
            let decrease = 0
            let redelostring = '';
            let blueelostring = '';
            let winteam = ''
            let loseteam = ''
            let winscore = 0
            let losescore = 0
            let redchange = []
            let bluechange = []
            let unixdate = parseInt((new Date().getTime() / 1000).toFixed(0))
            console.log(unixdate)
            if (redscore>bluescore) {
                await Promise.all(redteam.map(async(i) => {
                    let profileFindb = await profileModel.findOne({ discordid: i });
                    let foundDiv = profileFindb.division;
                    switch (foundDiv) {
                        case 'Coal': 
                            increase = 25
                            decrease = 5
                            break;
                        case 'Iron': 
                            increase = 25
                            decrease = 10
                            break;
                        case 'Gold': 
                            increase = 25
                            decrease = 15
                            break;
                        case 'Diamond': 
                            increase = 20
                            decrease = 15
                            break;
                        case 'Emerald': 
                            increase = 20
                            decrease = 20
                            break;
                        case 'Sapphire': 
                            increase = 20
                            decrease = 25
                            break;
                        case 'Ruby':
                            increase = 15
                            decrease = 25
                            break;
                        case 'Topaz':
                            increase = 15
                            decrease = 30
                            break;
                        case 'Crystal':
                            increase = 15
                            decrease = 35
                            break;
                        case 'Amethyst':
                            increase = 10
                            decrease = 35
                            break;
                        case 'Opal':
                            increase = 10
                            decrease = 40
                            break;
                        case 'Obsidian':
                            increase = 10
                            decrease = 45
                    };
                    let prevelo = profileFindb.elo;
                    let newelo = prevelo + increase;
                    if (newelo<0) {
                        newelo = 0
                    };
                    await elorankupdate(interaction, i, newelo)
                    let prevwins = profileFindb.wins;
                    let newwins = profileFindb.wins + 1
                    let ls = 0
                    let ws = profileFindb.ws + 1
                    let loss = profileFindb.losses
                    let newwlr = 0
                    if (loss == 0) {
                        newwlr = newwins
                    } else {
                        newwlr = newwins/loss
                        newwlr = newwlr.toFixed(2)
                    }
                    
                    let profileUpdate = await profileModel.findOneAndUpdate({ discordid: i }, { elo: newelo, wins: newwins, ls: ls, ws: ws, wlr: newwlr, lastupdated: `${unixdate}` });
                    let guilduser = await interaction.channel.guild.members.fetch(i);
                    redelostring = redelostring+`<@${guilduser.user.id}> ${prevelo} -> ${newelo}\n`;
                    guilduser.setNickname(`[${newelo}]${profileFindb.ign}`)
                }));
                await Promise.all(blueteam.map(async(i) => {
                    let profileFind = await profileModel.findOne({ discordid: i });
                    let foundDiv = profileFind.division;
                    switch (foundDiv) {
                        case 'Coal': 
                            increase = 25
                            decrease = 5
                            break;
                        case 'Iron': 
                            increase = 25
                            decrease = 10
                            break;
                        case 'Gold': 
                            increase = 25
                            decrease = 15
                            break;
                        case 'Diamond': 
                            increase = 20
                            decrease = 15
                            break;
                        case 'Emerald': 
                            increase = 20
                            decrease = 20
                            break;
                        case 'Sapphire': 
                            increase = 20
                            decrease = 25
                            break;
                        case 'Ruby':
                            increase = 15
                            decrease = 25
                            break;
                        case 'Topaz':
                            increase = 15
                            decrease = 30
                            break;
                        case 'Crystal':
                            increase = 15
                            decrease = 35
                            break;
                        case 'Amethyst':
                            increase = 10
                            decrease = 35
                            break;
                        case 'Opal':
                            increase = 10
                            decrease = 40
                            break;
                        case 'Obsidian':
                            increase = 10
                            decrease = 45
                    };
                    let prevelo = profileFind.elo;
                    let newelo = prevelo - decrease;
                    if (newelo<0) {
                        newelo = 0
                    }
                    await elorankupdate(interaction, i, newelo)
                    let prevwins = profileFind.wins;
                    let ws = 0
                    let ls = profileFind.ls + 1
                    let loss = profileFind.losses
                    let newloss = loss + 1
                    let newwlr = 0
                    if (prevwins == 0) {
                        newwlr = 0
                    } else {
                        newwlr = prevwins/newloss
                        newwlr = newwlr.toFixed(2)
                    }
                    let profileUpdate = await profileModel.findOneAndUpdate({ discordid: i }, { elo: newelo, losses: newloss, ls: ls, ws: ws, wlr: newwlr, lastupdated: `${unixdate}` });
                    let foundtag = await interaction.channel.guild.members.fetch(i)
                    blueelostring = blueelostring+`<@${foundtag.user.id}> ${prevelo} -> ${newelo}\n`
                    let guilduser = await interaction.channel.guild.members.fetch(i);
                    guilduser.setNickname(`[${newelo}]${profileFind.ign}`)
                }))
                winteam = '2';
                loseteam = '1';
                winscore = redscore;
                losescore = bluescore;
            }
            else {
                await Promise.all(redteam.map(async(i) => {
                    let profileFind = await profileModel.findOne({ discordid: i });
                    let foundDiv = profileFind.division;
                    switch (foundDiv) {
                        case 'Coal': 
                            increase = 25
                            decrease = 5
                            break;
                        case 'Iron': 
                            increase = 25
                            decrease = 10
                            break;
                        case 'Gold': 
                            increase = 25
                            decrease = 15
                            break;
                        case 'Diamond': 
                            increase = 20
                            decrease = 15
                            break;
                        case 'Emerald': 
                            increase = 20
                            decrease = 20
                            break;
                        case 'Sapphire': 
                            increase = 20
                            decrease = 25
                            break;
                        case 'Ruby':
                            increase = 15
                            decrease = 25
                            break;
                        case 'Topaz':
                            increase = 15
                            decrease = 30
                            break;
                        case 'Crystal':
                            increase = 15
                            decrease = 35
                            break;
                        case 'Amethyst':
                            increase = 10
                            decrease = 35
                            break;
                        case 'Opal':
                            increase = 10
                            decrease = 40
                            break;
                        case 'Obsidian':
                            increase = 10
                            decrease = 45
                    };
                    let prevelo = profileFind.elo;
                    let newelo = prevelo - decrease;
                    if (newelo<0) {
                        newelo = 0
                    }
                    await elorankupdate(interaction, i, newelo)
                    let prevwins = profileFind.wins;
                    let ws = 0
                    let ls = profileFind.ls + 1
                    let loss = profileFind.losses
                    let newloss = loss + 1
                    let newwlr = 0
                    if (prevwins == 0) {
                        newwlr = 0
                    } else {
                        newwlr = prevwins/newloss
                        newwlr = newwlr.toFixed(2)
                    }
                    newwlr = newwlr.toFixed(2)
                    let profileUpdate = await profileModel.findOneAndUpdate({ discordid: i }, { elo: newelo, losses: newloss, ls: ls, ws: ws, wlr: newwlr, lastupdated: `${unixdate}` });
                    let foundtag = await interaction.channel.guild.members.fetch(i)
                    redelostring = redelostring+`<@${foundtag.user.id}> ${prevelo} -> ${newelo}\n`
                    let guilduser = await interaction.channel.guild.members.fetch(i);
                    guilduser.setNickname(`[${newelo}]${profileFind.ign}`)
                }))
                await Promise.all(blueteam.map(async(i) => {
                    let profileFindb = await profileModel.findOne({ discordid: i });
                    let foundDiv = profileFindb.division;
                    switch (foundDiv) {
                        case 'Coal': 
                            increase = 25
                            decrease = 5
                            break;
                        case 'Iron': 
                            increase = 25
                            decrease = 10
                            break;
                        case 'Gold': 
                            increase = 25
                            decrease = 15
                            break;
                        case 'Diamond': 
                            increase = 20
                            decrease = 15
                            break;
                        case 'Emerald': 
                            increase = 20
                            decrease = 20
                            break;
                        case 'Sapphire': 
                            increase = 20
                            decrease = 25
                            break;
                        case 'Ruby':
                            increase = 15
                            decrease = 25
                            break;
                        case 'Topaz':
                            increase = 15
                            decrease = 30
                            break;
                        case 'Crystal':
                            increase = 15
                            decrease = 35
                            break;
                        case 'Amethyst':
                            increase = 10
                            decrease = 35
                            break;
                        case 'Opal':
                            increase = 10
                            decrease = 40
                            break;
                        case 'Obsidian':
                            increase = 10
                            decrease = 45
                    };
                    let prevelo = profileFindb.elo;
                    let newelo = prevelo + increase;
                    if (newelo<0) {
                        newelo = 0
                    };
                    await elorankupdate(interaction, i, newelo)
                    let prevwins = profileFindb.wins;
                    let newwins = profileFindb.wins + 1
                    let ls = 0
                    let ws = profileFindb.ws + 1
                    let loss = profileFindb.losses
                    let newwlr = 0
                    if (loss == 0) {
                        newwlr = 0
                    } else {
                        newwlr = newwins/loss
                        newwlr = newwlr.toFixed(2)
                    }
                    let profileUpdate = await profileModel.findOneAndUpdate({ discordid: i }, { elo: newelo, wins: newwins, ls: ls, ws: ws, wlr: newwlr, lastupdated: `${unixdate}` });
                    let guilduser = await interaction.channel.guild.members.fetch(i);
                    blueelostring = blueelostring+`<@${guilduser.user.id}> ${prevelo} -> ${newelo}\n`;
                    guilduser.setNickname(`[${newelo}]${profileFindb.ign}`)
                }));
                winteam = '1';
                loseteam = '2';
                winscore = bluescore;
                losescore = redscore;
            }
            
            console.log(typeof(redteam))
            console.log(typeof(blueteam))
            
            console.log(redelostring)
            console.log(redteam)
            console.log(game.redTeam)
            let gameLogEmbed = new MessageEmbed()
                .setTitle(`Game ${gameid} - Team ${winteam} Wins!`)
                .addFields(
                    {
                        name: 'Team 1',
                        value: `${blueelostring}`,
                        inline: false,
                    },
                    {
                        name: 'Team 2',
                        value: `${redelostring}`,
                        inline: false,
                    },
                )
                .setColor(colours.rww)
                .setFooter(`Scored By ${interaction.user.tag}`)
            const gameLogChannel = interaction.guild.channels.cache.get('967370797595381780');
            gameLogChannel.send({
                embeds: [gameLogEmbed],
                ephemeral: false,
            });

            let completionEmbed = new MessageEmbed()
                .setTitle('Game Scored')
                .setDescription(`Game ${gameid} Scored`)
                .setColor(colours.rww)
            await interaction.editReply({
                embeds: [completionEmbed],
                ephemeral: true,
            });
            await interaction.channel.delete()
            await redVc.delete()
            await blueVc.delete()
            let mappe = ''
            let funcData = []
            let individualMessage = false
            let embero = ''
            let table = ''
            let row = ''
                
                
            mappe = await profileModel.find();
            mappe = mappe.filter(function(value) {
                return value.elo>0
            });
            mappe = mappe.sort(function (b, a) {
                return a.elo - b.elo
            });
                            
            funcData = []
                            
            for (let pos = (pnum-10); pos < pnum && pos<mappe.length; pos++) {
                funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].elo})
            };
            table = format(2,funcData,4);

            lbembed = new MessageEmbed()
                .setTitle('Elo Leaderboard')
                .setDescription(table+ `\n\n ${individualMessage}`)
                .setColor(colours.blue_dark)
            let lbchannel = interaction.channel.guild.channels.fetch(channels.leaderboard)
            await lbchannel.bulkDelete(1)
            lbchannel.send({
                embeds: [lbembed]
            })
        }
        else if (optionselected === 'void') {
            if (interaction.channel.parentId !== channels.gamescategory) {
                let wrongchannelembed = new MessageEmbed()
                    .setTitle('Incorrect Channel')
                    .setDescription('Only do this command in game channels in order to score the game.')
                    .setColor(colours.rww)
                return interaction.editReply({
                    embeds: [wrongchannelembed],
                    ephemeral: true
                })
            };
            const foundUser = interaction.guild.members.cache.get(interaction.user.id);
            const scorerCheck = foundUser.roles.cache.find(r => r.name.toLowerCase() === 'scorer')
            if (!scorerCheck) {
                let wrongroleembed = new MessageEmbed()
                    .setTitle('You Do Not Have Permission!')
                    .setDescription('You are not a scorer!')
                    .setColor(colours.rww)
                return interaction.editReply({
                    embeds: [wrongroleembed],
                    ephemeral: true,
                });
            };
            const channelname = interaction.channel.name;
            const stringedchannelname = String(channelname);
            const gameid = stringedchannelname.substring(stringedchannelname.length-5);
            let reasoning = interaction.options.getString('reason')
            let gameLogEmbed = new MessageEmbed()
                .setTitle(`Game ${gameid} - Voided`)
                .addFields(
                    {
                        name: 'Reason',
                        value: `${reasoning}`,
                        inline: false,
                    } 
                    
                )
                .setColor(colours.rww)
                .setFooter(`Voided By ${interaction.user.tag}`)
            const gameLogChannel = interaction.guild.channels.cache.get('967370797595381780');
            gameLogChannel.send({
                embeds: [gameLogEmbed],
                ephemeral: false,
            });
            let completionEmbed = new MessageEmbed()
                .setTitle('Game Voided')
                .setDescription(`Game ${gameid} Voided`)
                .setColor(colours.rww)
            await interaction.editReply({
                embeds: [completionEmbed],
                ephemeral: true,
            });
            await interaction.channel.delete()
        }
    }
}

/*

FUNCTIONS

*/

async function sleep(delay) {
    var start = await new Date().getTime();
    while (await new Date().getTime() < start + delay);
}

async function elorankupdate(interaction, id, elo) {
    let lemember = await interaction.channel.guild.members.fetch(`${id}`)
    let coalrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'coal')
    let ironrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'iron')
    let goldrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'gold')
    let diamondrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'diamond')
    let emeraldrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'emerald')
    let sapphirerole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'sapphire')
    let rubyrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'ruby')
    let topazrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'topaz')
    let crystalrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'crystal')
    let amethystrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'amethyst')
    let opalrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'opal')
    let obsidianrole = await interaction.channel.guild.roles.cache.find(r => r.name.toLowerCase() === 'obsidian')
    if (elo>1099) {lemember.roles.remove(opalrole);lemember.roles.add(obsidianrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Obsidian' } ) }
    else if (elo>999) {lemember.roles.remove(amethystrole);lemember.roles.remove(obsidianrole);lemember.roles.add(opalrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Opal' } ) }
    else if (elo>899) {lemember.roles.remove(crystalrole);lemember.roles.remove(opalrole);lemember.roles.add(amethystrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Amethyst' } ) }
    else if (elo>799) {lemember.roles.remove(amethystrole);lemember.roles.remove(topazrole);lemember.roles.add(crystalrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Crystal' } ) }
    else if (elo>699) {lemember.roles.remove(crystalrole);lemember.roles.remove(rubyrole);lemember.roles.add(topazrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Topaz' } ) }
    else if (elo>599) {lemember.roles.remove(topazrole);lemember.roles.remove(sapphirerole);lemember.roles.add(rubyrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Ruby' } ) }
    else if (elo>499) {lemember.roles.remove(rubyrole);lemember.roles.remove(emeraldrole);lemember.roles.add(sapphirerole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Sapphire' } ) }
    else if (elo>399) {lemember.roles.remove(sapphirerole);lemember.roles.remove(diamondrole);lemember.roles.add(emeraldrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Emerald' } ) }
    else if (elo>299) {lemember.roles.remove(emeraldrole);lemember.roles.remove(goldrole);lemember.roles.add(diamondrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Diamond' } ) }
    else if (elo>199) {lemember.roles.remove(diamondrole);lemember.roles.remove(ironrole);lemember.roles.add(goldrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Gold' } ) }
    else if (elo>99) {lemember.roles.remove(goldrole);lemember.roles.remove(coalrole);lemember.roles.add(ironrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Iron' } ) }
    else {lemember.roles.remove(ironrole);lemember.roles.add(coalrole); await profileModel.findOneAndUpdate({ discordid: id }, { division: 'Coal' } ) };
}