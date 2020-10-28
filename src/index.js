global.__base = __dirname;
require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.json')
const memory = require('./memory.json')
const events = require('./util/events')

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.config = config
client.memory = memory
client.events = events
client.state = {}

client.events.on('memory-changed', async (resolve, reject, { memory = {} }) => {
	await fs.writeFile(`${__dirname}/memory.json`, JSON.stringify(memory), (err) => {
		reject(err)
	})
	resolve({
		then: () =>
		console.log('memory saved')
	})
})

const commandFiles = fs
	.readdirSync(__dirname + '/commands')
	.filter((file) => file.endsWith('.js'))
commandFiles.forEach((file) => {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
})

client.once('ready', () => {
	console.log(`Meu nome é ${config.name}, e eu estou pronto.`)
})

client.on('message', (message) => {
	if (message.author.bot) return

	if (client.state.game) {
		console.log(client.state, message.content.toUpperCase(), client.state.game.votes[message.content.toUpperCase()]);
		if (message.content.length === 1 && client.state.game.votes.hasOwnProperty(message.content.toUpperCase())) {
			if (!client.state.game.alreadyVoted.some( u => u === message.author.id )) {
				client.state.game.votes[message.content.toUpperCase()] += 1
				client.state.game.alreadyVoted.push(message.author.id)
			}
		}
	}

	if (!message.content.startsWith(config.prefix)) return

	const args = message.content.slice(config.prefix.length).trim().split(/ +/)
	const command = args.shift().toLowerCase()

	if (!client.commands.has(command)) return

	try {
		client.commands.get(command).execute(message, args)
	} catch (error) {
		console.error(error)
		message.reply('Houve um erro ao executar este comando!')
	}
})

client.login(process.env['BOT_TOKEN'])
