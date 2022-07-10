const { Collection, Client, Intents, Permissions, MessageEmbed, Message, MessageAttachment } = require('discord.js');
const { Discord } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const profileModel = require('./schemas/profile');
const { connection } = require('./handlers/database');
const serverModel = require('./schemas/server');
const gameModel = require('./schemas/game');
const channels = require('./configs/channels.json')
const colours = require('./configs/colours.json')
const maplist = ['Archway', 'Chained', 'Eastwood', 'Gardens', 'Invasion', 'Lectus', 'Swashbuckle']
let yellowlist = []
let redlist = []
// Intents
const myIntents = new Intents();
// Guild Intents
myIntents.add('GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_WEBHOOKS', 'GUILD_INVITES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES');
// Direct Intents
myIntents.add('DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS');
const fs = require('fs');
// Client Creation
const client = new Client({
    allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: true
    },
    intents: myIntents
});
const config = require('./configs/config.json')

const token = config.token

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const commands = []
client.commands = new Collection()
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
	client.commands.set(command.data.name, command)
}
client.on('ready', async () => {
	console.log(`Ready! Signed in as ${client.user.username}`);
	client.user.setStatus('online')
	client.user.setActivity('Ranked Bedwars', { type: 'PLAYING' });
	const rest = new REST({
		version: '9'
	}).setToken(token);
	await connection(client);
	(async () => {
		try {
			/*await rest.put(Routes.applicationGuildCommands(client.user.id, '959389221909577749'), {
				body: commands
			});*/
            console.log('Successfully Registered Commands')
			console.log(`
██████╗░██████╗░░██╗░░░░░░░██╗
██╔══██╗██╔══██╗░██║░░██╗░░██║
██████╔╝██████╦╝░╚██╗████╗██╔╝
██╔══██╗██╔══██╗░░████╔═████║░
██║░░██║██████╦╝░░╚██╔╝░╚██╔╝░
╚═╝░░╚═╝╚═════╝░░░░╚═╝░░░╚═╝░░
`)
        } catch (err) {
            console.log('Commands Failed To Register')
            if (err) console.error(err)
        }
	})();

});
client.on('messageCreate', async (message) => {
	if(!message.guild || message.author.bot) return;
	
	if (message.content.startsWith('=submit')) {
		if (message.channel.parentId !== channels.gamescategory) {
			let wrongchannelembedt = new MessageEmbed()
				.setTitle('Only do this command in a game channel')
				.setColor(colours.red_dark)
			return message.channel.send({
				embeds: [wrongchannelembedt]
			})
		}
		let link = ''
		message.attachments.forEach(attachment => {
			link = attachment.proxyURL
		})
		let submitchannel = await message.channel.guild.channels.fetch(channels.submit)
		let gameid = await message.channel.name.substring((message.channel.name).length-5);
		submitchannel.send({
			content: `${gameid} <#${message.channel.id}> ${link}`
		})
	}
})
/*client.on('messageCreate', async (message) => {
	if(!message.guild || message.author.bot) return;
	
	
    if(!message.content.startsWith(prefix)) return;

	try {
		if(!message.member) message.member = await message.guild.fetchMember(message);
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const cmd = args.shift().toLowerCase();
		let command = client.commands.get(cmd);
		if(!command) command = client.commands.get(client.aliases.get(cmd));
		if(!command) return;
		command.run(client, message, args);
	}
	catch (err) {
		message.channel.send(`\`${err}\``);
		return;
	}
	
});
*/

client.on('voiceStateUpdate', async (oldState, newState) => {
	if (newState.channelId !== null) {
		let regcheck = ''
		const joinedUser = newState.guild.members.cache.get(newState.member.user.id)
		const counter = newState.channel.members.size;
		let division = '';
		switch(newState.channel.id) {
			case channels['2v2q']:
				regcheck = await profileModel.findOne({ discordid: newState.member.user.id })
				if (!regcheck) return newState.disconnect()
				console.log('k')
				if (counter == 4) {
					
					console.log('Nay')
					let playerarray = []
					newState.channel.members.forEach(m => {
						playerarray.push(m.user.id)
					})
					const serverProfile = await serverModel.findOne({ ID: 1 });
					const verbatimId = serverProfile.idTracker;
					const uppedId = verbatimId + 1;
					const serverProfileUpdate = await serverModel.findOneAndUpdate({ ID: 1 }, { idTracker: uppedId});
					const stringedId = String(uppedId);
					let trueGameId = ''
					switch(stringedId.length) {
						case 1: 
							trueGameId = '0000' + stringedId
							break;
						case 2:
							trueGameId = '000' + stringedId
							break;
						case 3: 
							trueGameId = '00' + stringedId
							break;
						case 4: 
							trueGameId = '0' + stringedId
							break;
						default:
							trueGameId = stringedId
							break;
					}
					const gameChannel = await gameChannelCreation(newState, 'game', trueGameId)
					const blueVc = await blueVcCreation(newState, 'BLUE', trueGameId);
					const redVc = await redVcCreation(newState, 'RED', trueGameId)
					
					let guildM = ''
					newState.channel.members.forEach(async m => {
						guildM = newState.guild.members.cache.get(m.id)
						console.log(m.id)
						await gameChannel.permissionOverwrites.edit(m.user, { VIEW_CHANNEL: true, SEND_MESSAGES: true, ATTACH_FILES: true });
						
						/*await gameVc.permissionOverwrites.edit(m.user, { VIEW_CHANNEL: true, CONNECT: true });
						await guildM.voice.setChannel(guildGameVc)*/
					});
					let shuffledPlayers = shuffler(playerarray)
					const shuffledLength = shuffledPlayers.length
					const teamsArray = splitter(shuffledPlayers, shuffledLength);
					const blueTeam = teamsArray[0];
					const redTeam = teamsArray[1];
					console.log('Shuffled '+shuffledPlayers);
					console.log('Red '+redTeam)
					console.log('Blue '+blueTeam)
					console.log('All '+teamsArray)
				    await redTeam.forEach(async m => {
						guildM = newState.guild.members.cache.get(m)
						await redVc.permissionOverwrites.edit(guildM.user, { CONNECT: true, VIEW_CHANNEL: true })
						guildM.voice.setChannel(redVc)
						console.log(m)
					})
					await blueTeam.forEach(async l => {
						guildL = newState.guild.members.cache.get(l)
						await blueVc.permissionOverwrites.edit(guildL.user, { CONNECT: true, VIEW_CHANNEL: true })
						guildL.voice.setChannel(blueVc)
						console.log(l)
					})
					const gameChannelId = gameChannel.id;
					let gameProfile = new gameModel({
						gameId: trueGameId,
						channelId: gameChannelId,
						players: playerarray,
						blueTeam: blueTeam,
						redTeam: redTeam,
						redVcId: redVc.id,
						blueVcId: blueVc.id,
					}).save();
					let blueMentionArray = []
					let redMentionArray = []
					blueTeam.forEach(id => {
						blueMentionArray.push(`<@${id}> \n`)
					});
					redTeam.forEach(id => {
						redMentionArray.push(`<@${id}> \n`)
					});
					let rankedStartEmbed = new MessageEmbed()
						.setTitle(`Ranked Game ${trueGameId}`)
						.addFields(
							{
								name: 'Team 1',
								value: `${blueMentionArray}.`,
								inline: true,
							},
							{
								name: 'Team 2',
								value: `${redMentionArray}.`,
								inline: true,
							}
						)
						.setDescription('Whilst you can leave the vc you are in, if you attempt to queue whilst in this game **you will lose elo**. This is in order to prevent attempts to game stack for elo. \n\nTo end the game submit a photo of the game result and wait for a scorer to score the game. ')
					gameChannel.send(
						{
							embeds: [rankedStartEmbed]
						}
					)
					let greenrand = Math.floor(Math.random()*maplist.length);
					let greenoption = maplist[greenrand];
					yellowlist = maplist.splice(greenrand, 1);
					let yellowrand = Math.floor(Math.random()*yellowlist.length);
					let yellowoption = yellowlist[yellowrand];
					redlist = maplist.splice(greenrand, 1);
					let redoption = redlist[Math.floor(Math.random()*yellowlist.length)];
					let optionsEmbed = new MessageEmbed()
						.setTitle('Map Selection')
						.setDescription(`Vote for a map\n\n🟢-${greenoption}\n🟡-${yellowoption}\n🔴-${redoption}\n\nReact For The Map`)
						.setColor('BLURPLE')
					const optmsg = await gameChannel.send({
						embeds: [optionsEmbed]
					})
					await optmsg.react('🟢')
					await optmsg.react('🟡')
					await optmsg.react('🔴')
				}
				else console.log(counter)
				break;
			case channels['3v3q']:
				regcheck = await profileModel.findOne({ discordid: newState.member.user.id })
				if (!regcheck) return newState.disconnect()
				if (counter == 6) {
					console.log('Nay')
					let playerarray = []
					newState.channel.members.forEach(m => {
						playerarray.push(m.user.id)
					})
					const serverProfile = await serverModel.findOne({ ID: 1 });
					const verbatimId = serverProfile.idTracker;
					const uppedId = verbatimId + 1;
					const serverProfileUpdate = await serverModel.findOneAndUpdate({ ID: 1 }, { idTracker: uppedId});
					const stringedId = String(uppedId);
					let trueGameId = ''
					switch(stringedId.length) {
						case 1: 
							trueGameId = '0000' + stringedId
							break;
						case 2:
							trueGameId = '000' + stringedId
							break;
						case 3: 
							trueGameId = '00' + stringedId
							break;
						case 4: 
							trueGameId = '0' + stringedId
							break;
						default:
							trueGameId = stringedId
							break;
					}
					const gameChannel = await gameChannelCreation(newState, 'game', trueGameId)
					const blueVc = await blueVcCreation(newState, 'BLUE', trueGameId);
					const redVc = await redVcCreation(newState, 'RED', trueGameId)
					
					let guildM = ''
					newState.channel.members.forEach(async m => {
						guildM = newState.guild.members.cache.get(m.id)
						console.log(m.id)
						await gameChannel.permissionOverwrites.edit(m.user, { VIEW_CHANNEL: true, SEND_MESSAGES: true, ATTACH_FILES: true });
						/*await gameVc.permissionOverwrites.edit(m.user, { VIEW_CHANNEL: true, CONNECT: true });
						await guildM.voice.setChannel(guildGameVc)*/
					});
					let shuffledPlayers = shuffler(playerarray)
					const shuffledLength = shuffledPlayers.length
					const teamsArray = splitter(shuffledPlayers, shuffledLength);
					const blueTeam = teamsArray[0];
					const redTeam = teamsArray[1];
					redTeam.forEach(async m => {
						guildM = newState.guild.members.cache.get(m)
						await redVc.permissionOverwrites.edit(guildM.user, { CONNECT: true, VIEW_CHANNEL: true })
						guildM.voice.setChannel(redVc)
					})
					blueTeam.forEach(async m => {
						guildM = newState.guild.members.cache.get(m)
						await blueVc.permissionOverwrites.edit(guildM.user, { CONNECT: true, VIEW_CHANNEL: true })
						guildM.voice.setChannel(blueVc)
					})
					const gameChannelId = gameChannel.id;
					let gameProfile = new gameModel({
						gameId: trueGameId,
						channelId: gameChannelId,
						players: playerarray,
						blueTeam: blueTeam,
						redTeam: redTeam,
						redVcId: redVc.id,
						blueVcId: blueVc.id,
					}).save();
					let blueMentionArray = []
					let redMentionArray = []
					blueTeam.forEach(id => {
						blueMentionArray.push(`<@${id}> \n`)
					});
					redTeam.forEach(id => {
						redMentionArray.push(`<@${id}> \n`)
					});
					let rankedStartEmbed = new MessageEmbed()
						.setTitle(`Ranked Game ${trueGameId}`)
						.addFields(
							{
								name: 'Blue Team',
								value: `${blueMentionArray}.`,
								inline: true,
							},
							{
								name: 'Red Team',
								value: `${redMentionArray}.`,
								inline: true,
							}
						)
						.setDescription('Whilst you can leave the vc you are in, if you attempt to queue whilst in this game **you will lose elo**. This is in order to prevent attempts to game stack for elo. \n\nTo end the game submit a photo of the game end and run the command /endgame <Blue Score> <Red Score>. This will then need 4 vouches to end the game. \n\nTo be clear, **DO NOT ATTEMPT TO REQUEUE WHILE IN THIS GAME**.')
					gameChannel.send(
						{
							embeds: [rankedStartEmbed]
						}
					)
				}
				else console.log(counter)
				break;
			case channels['4v4q']:
				regcheck = await profileModel.findOne({ discordid: newState.member.user.id })
				if (!regcheck) return newState.disconnect()
				if (counter == 8) {
					console.log('Nay')
					let playerarray = []
					newState.channel.members.forEach(m => {
						playerarray.push(m.user.id)
					})
					const serverProfile = await serverModel.findOne({ ID: 1 });
					const verbatimId = serverProfile.idTracker;
					const uppedId = verbatimId + 1;
					const serverProfileUpdate = await serverModel.findOneAndUpdate({ ID: 1 }, { idTracker: uppedId});
					const stringedId = String(uppedId);
					let trueGameId = ''
					switch(stringedId.length) {
						case 1: 
							trueGameId = '0000' + stringedId
							break;
						case 2:
							trueGameId = '000' + stringedId
							break;
						case 3: 
							trueGameId = '00' + stringedId
							break;
						case 4: 
							trueGameId = '0' + stringedId
							break;
						default:
							trueGameId = stringedId
							break;
					}
					const gameChannel = await gameChannelCreation(newState, 'game', trueGameId)
					const blueVc = await blueVcCreation(newState, 'BLUE', trueGameId);
					const redVc = await redVcCreation(newState, 'RED', trueGameId)
					
					let guildM = ''
					newState.channel.members.forEach(async m => {
						guildM = newState.guild.members.cache.get(m.id)
						console.log(m.id)
						await gameChannel.permissionOverwrites.edit(m.user, { VIEW_CHANNEL: true, SEND_MESSAGES: true, ATTACH_FILES: true });
						/*await gameVc.permissionOverwrites.edit(m.user, { VIEW_CHANNEL: true, CONNECT: true });
						await guildM.voice.setChannel(guildGameVc)*/
					});
					let shuffledPlayers = shuffler(playerarray)
					const shuffledLength = shuffledPlayers.length
					const teamsArray = splitter(shuffledPlayers, shuffledLength);
					const blueTeam = teamsArray[0];
					const redTeam = teamsArray[1];
					redTeam.forEach(async m => {
						guildM = newState.guild.members.cache.get(m)
						await redVc.permissionOverwrites.edit(guildM.user, { CONNECT: true, VIEW_CHANNEL: true })
						guildM.voice.setChannel(redVc)
					})
					blueTeam.forEach(async m => {
						guildM = newState.guild.members.cache.get(m)
						await blueVc.permissionOverwrites.edit(guildM.user, { CONNECT: true, VIEW_CHANNEL: true })
						guildM.voice.setChannel(blueVc)
					})
					const gameChannelId = gameChannel.id;
					let gameProfile = new gameModel({
						gameId: trueGameId,
						channelId: gameChannelId,
						players: playerarray,
						blueTeam: blueTeam,
						redTeam: redTeam,
						redVcId: redVc.id,
						blueVcId: blueVc.id,
					}).save();
					let blueMentionArray = []
					let redMentionArray = []
					blueTeam.forEach(id => {
						blueMentionArray.push(`<@${id}> \n`)
					});
					redTeam.forEach(id => {
						redMentionArray.push(`<@${id}> \n`)
					});
					let rankedStartEmbed = new MessageEmbed()
						.setTitle(`Ranked Game ${trueGameId}`)
						.addFields(
							{
								name: 'Blue Team',
								value: `${blueMentionArray}.`,
								inline: true,
							},
							{
								name: 'Red Team',
								value: `${redMentionArray}.`,
								inline: true,
							}
						)
						.setDescription('Whilst you can leave the vc you are in, if you attempt to queue whilst in this game **you will lose elo**. This is in order to prevent attempts to game stack for elo. \n\nTo end the game submit a photo of the game end and run the command /endgame <Blue Score> <Red Score>. This will then need 4 vouches to end the game. \n\nTo be clear, **DO NOT ATTEMPT TO REQUEUE WHILE IN THIS GAME**.')
					gameChannel.send(
						{
							embeds: [rankedStartEmbed]
						}
					)
				}
				else console.log(counter)
				break;
		};
	}
})
client.on('interactionCreate', async (interaction) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return;
		try {
			await command.execute(interaction)
		} catch (err) {
			console.log(err)
		}
	} else if (interaction.isButton()) {
		switch(interaction.customId) {
			case 'mobileelo':
				mappe = await profileModel.find()  // Get data from mongodb}
				mappe = mappe.filter(function(value) {
                return value.elo>0
    	    	})
	        	mappe = mappe.sort(function (b, a) {					//Sort Data into correct order
	                return a.elo - b.elo
    		    })

	        
	        	individualMessage = false
				funcData = []

				for (let pos = 0; pos < 50 && pos < mappe.length; pos++) {	//For each player in grabbed data

					funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].elo})

					
	    	    };

        

				table = format(1,funcData,0)
				if (typeof(table) == Array) {message.channel.send({content: table})}

	        	embero = new MessageEmbed()
    	        	.setTitle('Leaderboard - Elo')
	    	        .setDescription(table)
    	    	    .setColor(colours.blue_dark)

        	
        		interaction.reply({ embeds: [embero], ephemeral: true })
				break;
			case 'mobilewlr':
				mappe = await profileModel.find()  // Get data from mongodb}
				mappe = mappe.filter(function(value) {
					return value.wlr>0
				})
				mappe = mappe.sort(function (b, a) {					//Sort Data into correct order
					return a.wlr - b.wlr
				})

			
				individualMessage = false
				funcData = []

				for (let pos = 0; pos < 50 && pos < mappe.length; pos++) {	//For each player in grabbed data

					funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].wlr})

					
				};

		

				table = format(1,funcData,0)
				if (typeof(table) == Array) {message.channel.send({content: table})}

				embero = new MessageEmbed()
					.setTitle('Leaderboard - WLR')
					.setDescription(table)
					.setColor(colours.blue_dark)

			
				interaction.reply({ embeds: [embero], ephemeral: true })
				break;
			case 'mobilews':
				mappe = await profileModel.find()  // Get data from mongodb
				mappe = mappe.sort(function (b, a) {					//Sort Data into correct order
					return a.ws - b.ws
				})

			
				individualMessage = false
				funcData = []

				for (let pos = 0; pos < 50 && pos < mappe.length; pos++) {	//For each player in grabbed data

					funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].ws})

					
				};

		

				table = format(1,funcData,0)
				if (typeof(table) == Array) {message.channel.send({content: table})}

				embero = new MessageEmbed()
					.setTitle('Leaderboard - Wins')
					.setDescription(table)
					.setColor(colours.blue_dark)

			
				interaction.reply({ embeds: [embero], ephemeral: true })
				break;
			case 'mobilewins':
				mappe = await profileModel.find()  // Get data from mongodb}
				mappe = mappe.filter(function(value) {
					return value.wins>0
				})
				mappe = mappe.sort(function (b, a) {					//Sort Data into correct order
					return a.wins - b.wins
				})

			
				individualMessage = false
				funcData = []

				for (let pos = 0; pos < 50 && pos < mappe.length; pos++) {	//For each player in grabbed data

					funcData.push({"uName" : mappe[pos].ign, "uWins" : mappe[pos].wins})

					
				};

		

				table = format(1,funcData,0)
				if (typeof(table) == Array) {message.channel.send({content: table})}

				embero = new MessageEmbed()
					.setTitle('Leaderboard - Winstreak')
					.setDescription(table)
					.setColor(colours.blue_dark)

			
				interaction.reply({ embeds: [embero], ephemeral: true })
				break;
		}
	}
})
client.login(token)
//use own token

/*

FUNCTIONS

*/

/*

MISC FUNCTIONS

*/
function shuffler(array) {
	var j, x, i;
	for (i = array.length - 1; i>0; i--) {
		j = Math.floor(Math.random() * (i+1));
		x = array[i]
		array[i] = array[j]
		array[j] = x
	};
	return array
};
function splitter(array, len) {
	const blueArr = array.slice(0, len/2);
	const redArr = array.slice(len/2, len)
	return [blueArr, redArr]
};
/*

GAME FUNCTIONS

*/

async function gameChannelCreation(newState, prefix, gameId) {
	const scorerRole = await newState.guild.roles.cache.find(r => r.name.toLowerCase() == 'scorer');
	const scorerId = await scorerRole.id
	const gameChannel = await newState.guild.channels.create(`${prefix}-${gameId}`, {
		type: 'text',
		permissionOverwrites: [
			{
				id: newState.guild.id,
				deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES],
			},
			{
				id: scorerId,
				allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_APPLICATION_COMMANDS]
			},
		],
	}).catch(err => console.log(`Game Channel Creation - Error Occured: ${err}`))
	const category = await newState.guild.channels.cache.get('970315450191843368');
	await gameChannel.setParent(category);
	return gameChannel;
};
async function redVcCreation(newState, prefix, gameId) {
	const redVc = await newState.guild.channels.create(`${prefix}-VC-${gameId}`, {
		type: 'GUILD_VOICE',
		permissionOverwrites: [
			{
				id: newState.guild.id,
				deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]
			},
		],
	}).catch(err => console.log(`Game Channel Creation - Error Occured: ${err}`))
	const category = await newState.guild.channels.cache.get('967370694251913266');
	await redVc.setParent(category);
	return redVc;
};
async function blueVcCreation(newState, prefix, gameId) {
	const blueVc = await newState.guild.channels.create(`${prefix}-VC-${gameId}`, {
		type: 'GUILD_VOICE',
		permissionOverwrites: [
			{
				id: newState.guild.id,
				deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CONNECT]
			},
		],
	}).catch(err => console.log(`Game Channel Creation - Error Occured: ${err}`))
	const category = await newState.guild.channels.cache.get('967370694251913266');
	await blueVc.setParent(category);
	return blueVc;
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