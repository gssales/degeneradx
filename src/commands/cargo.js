const Discord = require('discord.js');

const name = 'cargo';
const description = 'Interface de visão dos cargos';

const options = {
  ajuda: (message, _) => {
    const { prefix } = message.client.config;
    const helpMessage = new Discord.MessageEmbed()
      .setTitle(`${prefix}${name} <opção>`)
      .setAuthor('Degeneradx')
      .setDescription(description)
      .addField(`${prefix}${name} ajuda`, 'Apresenta esta lista de comandos')
      .addField(
        `${prefix}${name} list [me || @User]`,
        `${prefix}${name} list : lista todos os cargos do server
					\n${prefix}${name} list me: lista todos os cargos de quem executou o comando
					\n${prefix}${name} list @user: lista todos os cargos de um usuário`,
      );
    message.channel.send(helpMessage);
  },

  list: (message, args) => {
    if (args.length > 1) {
      const { prefix } = message.client.config;
      const option = args.shift();

      if (option === 'me') {
        options.list_me(message, args);
      } else if (option.match(/^<@!?(\d+)>$/)) {
        if (message.mentions.members.first()) {
          options.list_user(message, args);
        } else {
          message
            .reply(`${option} não é um membro válido do server`)
            .then((m) => m.react('❌'));
        }
      } else {
        message
          .reply(
            `\`\`${prefix}${name} list ${option}\`\` não é uma opção válida`,
          )
          .then((m) => m.react('❌'));
      }
    } else {
      message.guild.roles.fetch().then((roles) => {
        const rolesList = roles.cache
          .map(
            (role) => `${role.name.startsWith('@') ? '\\' : '@'}${role.name}`,
          )
          .reduce((acm, next) => `${acm}\n${next}`);

        const listMessage = new Discord.MessageEmbed().addField(
          'Lista de cargos no servidor',
          rolesList,
        );

        message.channel.send(listMessage);
      });
    }
  },

  list_me: (message, _) => {
    const authorRoles = message.member.roles.cache;

    const rolesList = authorRoles
      .map((role) => `${role.name.startsWith('@') ? '\\' : '@'}${role.name}`)
      .reduce((acm, next) => `${acm}\n${next}`);

    const listMessage = new Discord.MessageEmbed()
      .setDescription(`Cargos de ${message.author} no servidor`)
      .addField('\u200B', rolesList);

    message.channel.send(listMessage);
  },

  list_user: (message, _) => {
    message.mentions.members.forEach((member) => {
      const mentionRoles = member.roles.cache;

      const rolesList = mentionRoles
        .map((role) => `${role.name.startsWith('@') ? '\\' : '@'}${role.name}`)
        .reduce((acm, next) => `${acm}\n${next}`);

      const listMessage = new Discord.MessageEmbed()
        .setDescription(`Cargos de ${member} no servidor`)
        .addField('\u200B', rolesList);

      message.channel.send(listMessage);
    });
  },
};

module.exports = {
  name: name,
  description: description,
  execute(message, args) {
    const option = args.shift();
    if (!option) {
      options.ajuda(message, args);
    } else if (options[option]) {
      options[option](message, args);
    } else {
      message
        .reply(`${option} não é uma opção válida`)
        .then((m) => m.react('❌'));
    }
  },
};
