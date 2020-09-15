require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')
const config = require('./config.json')
const memory = require('./memory')

const client = new Discord.Client()
client.commands = new Discord.Collection()
client.config = config
client.memory = memory

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
	if (!message.content.startsWith(config.prefix) || message.author.bot) return

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
