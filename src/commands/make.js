const Discord = require('discord.js')

const name = 'make'
const description = 'Comando para criar coisas'

const options = {
    canal: (message, args) => {
		const dIndex = getArgD(args)
		let duration = 0
        if (dIndex >= 0) {
			duration = parseInt(args[dIndex+1])
			args.splice(dIndex,2)
			if (!duration || duration < 10 || duration > 86400) {
				message.reply('A duração em segundos precisa estar entre 10 e 86400').then((m) => m.react('❌'))
				return
			}
		}
		if (duration === 0) {
			if (!message.member.hasPermission(Discord.Permissions.ADMINISTRATOR)) {
				message.reply('Apenas administradores podem fazer canais permanentes').then((m) => m.react('❌'))
				return
			}
		}
		
		const channelManager = message.guild.channels
		const memory = message.client.memory
		channelManager.create(category_uuid(), {
			type: 'category'
		}).then((category) => {
			channelManager.create(text_uuid(), {
				type: 'text',
				parent: category,
			}).then((channel) => {

				if (message.mentions.members.array().length > 0) {
					channel.createOverwrite(message.guild.roles.everyone, {
						VIEW_CHANNEL: false,
					})

					message.mentions.members.array().forEach(member => {
						channel.createOverwrite(member, {
							VIEW_CHANNEL: true,
						})
					});
				}

				if (duration > 0) {
					channel.send(`Este canal se auto destruirá em ${duration} segundos`)
					message.client.memory[channel.id] = 
					setTimeout(() => {
						channel.delete()
						category.delete()
					}, duration*1000)
				} else {
					channel.send('Este é um canal permanente')
				}
			})
		})
    }
}

function getArgD(args) {
    const dIndex = args.findIndex( arg => arg === '-d' || arg === '--duration' )
    return dIndex
}

function half_uuid() {
	const chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f']
	return 'xxxx-mxxx-nxxx-xxxx'
		.replace(/[x]/g, () => chars[Math.floor(Math.random() * chars.length)])
		.replace(/[n]/g, 'd')
}

function category_uuid() {
	return half_uuid().replace('m', '0');
}

function text_uuid() {
	return half_uuid().replace('m', '1');
}

function voice_uuid() {
	return half_uuid().replace('m', '2');
}

module.exports = {
	name: name,
	description: description,
	execute(message, args) {
		const option = args.shift()
		if (option && options[option]) {
			options[option](message, args)
		} else {
			message
				.reply(`${option} não é uma opção válida`)
				.then((m) => m.react('❌'))
		}
	},
}