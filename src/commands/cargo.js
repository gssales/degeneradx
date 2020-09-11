const Discord = require('discord.js')

const name = 'cargo';
const description = 'Interface de visão dos cargos';

const options = {

	ajuda: (message, args) => {
		const helpMessage = new args[0].MessageEmbed()
			.setTitle(`${args[2].prefix}${name} <opção>`)
			.setAuthor("Degeneradx")
			.setDescription(description)
			.addField(`${args[2].prefix}${name} ajuda`, 'Apresenta esta lista de comandos')
			.addField(`${args[2].prefix}${name} list [me || @User]`, `${args[2].prefix}${name} list : lista todos os cargos do server
					\n${args[2].prefix}${name} list me: lista todos os cargos de quem executou o comando
					\n${args[2].prefix}${name} list @user: lista todos os cargos de um usuário`)
		message.channel.send(helpMessage);
	},

	lista: (message, args) => {
		if (args.length > 4) {
			let option = args[4]
			
			if (option === 'me')
				options.list_me(message, args)
			else if (option.match(/^<@!?(\d+)>$/))
				if (message.mentions.members.first())
					options.list_user(message, args)
				else
					message.reply(`${option} não é um membro válido do server`).then( m => m.react('❌'));
			else
				message.reply(`\`\`${args[2].prefix}${name} list ${args[4]}\`\` não é uma opção válida`).then( m => m.react('❌'));

		} else {
			const Discord = args.shift();

			message.guild.roles.fetch().then( roles => {

				const rolesList = roles.cache
				.map( role => 
					`${role.name.startsWith('@') ? '\\' : '@'}${role.name}`)
				.reduce( (acm, next) => 
					`${acm}\n${next}`)

				const listMessage = new Discord.MessageEmbed()
					.addField('Lista de cargos no servidor', rolesList)

				message.channel.send(listMessage)
			})
		}
	},

	list_me: (message, args) => {
		const Discord = args.shift();
		
		const authorRoles = message.member.roles.cache

		const rolesList = authorRoles
		.map( role => 
			`${role.name.startsWith('@') ? '\\' : '@'}${role.name}`)
		.reduce( (acm, next) => 
			`${acm}\n${next}`)

		const listMessage = new Discord.MessageEmbed()
			.setDescription(`Cargos de ${message.author} no servidor`)
			.addField('\u200B', rolesList)

		message.channel.send(listMessage)
	},

	list_user: (message, args) => {
		const Discord = args.shift();

		message.mentions.members.forEach(member => {
			const mentionRoles = member.roles.cache

			const rolesList = mentionRoles
			.map( role => 
				`${role.name.startsWith('@') ? '\\' : '@'}${role.name}`)
			.reduce( (acm, next) => 
				`${acm}\n${next}`)
	
			const listMessage = new Discord.MessageEmbed()
				.setDescription(`Cargos de ${member} no servidor`)
				.addField('\u200B', rolesList)
	
			message.channel.send(listMessage)
		})
	}

};

module.exports = {
	name: name,
	description: description,
	execute(message, args) {
		
		const option = args[3];
		if (!option) {
			options.ajuda(message, args);
		} else if (options.hasOwnProperty(option)) {
			options[option](message, args);
		} else {
			message.reply(`${option} não é uma opção válida`).then( m => m.react('❌'));
		}
	}
};