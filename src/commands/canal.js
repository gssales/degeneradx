const Discord = require('discord.js');

const name = 'canal';
const description = 'Interface de visão dos canais';

const options = {
  ajuda: (message, _) => {
    const { prefix } = message.client.config;
    const command = `${prefix}${name}`;

    const helpMessage = new Discord.MessageEmbed()
      .setTitle(command)
      .setDescription(description)
      .addField(
        'Opções',
        `\`\`${command} help\`\` - Apresenta esta lista de comandos\n
        \`\`${command} lista [me] [...members]\`\` - Lista os canais em que o autor ou os membros participam\n
        \`\`${command} join\`\` - \n
        \`\`${command} leave\`\` - \n`,
      );
    message.channel.send(helpMessage);
  },

  lista: (message, args) => {
    const { prefix } = message.client.config;
    const target = args.shift();

    let channels = message.guild.channels.cache;

    if (target) {
      if (target === 'me') {
        channels = channels.filter((c) =>
          c
            .permissionsFor(message.member)
            .has(Discord.Permissions.FLAGS.VIEW_CHANNEL),
        );
      } else if (
        target.match(/^<@!?(\d+)>$/) &&
        message.mentions.members.first()
      ) {
        channels = channels.filter((c) =>
          c
            .permissionsFor(message.mentions.members.first())
            .has(Discord.Permissions.FLAGS.VIEW_CHANNEL),
        );
      } else {
        message
          .reply(
            `\`\`${prefix}${name} list ${target}\`\` não é uma opção válida`,
          )
          .then((m) => m.react('❌'));
        return;
      }
    }

    const nocat = channels.filter(
      (c) => c.type !== 'category' && c.parentID === null,
    );
    nocat.sort((a, b) => a.rawPosition - b.rawPosition);

    const cats = channels.filter((c) => c.type === 'category');
    cats.sort((a, b) => a.rawPosition - b.rawPosition);
    cats.forEach((cat) => {
      cat.subchannels = channels.filter((c) => c.parentID === cat.id);
      cat.subchannels.sort((a, b) => a.rawPosition - b.rawPosition);
    });

    const nocatList = nocat.reduce((acm, next) => `${acm}\n${next}`, '\t');
    const catsFields = cats.map((cat) => ({
      name: cat.name,
      value: cat.subchannels.reduce((acm, next) => `${acm}\n${next}`, '\t'),
    }));

    const listMessage = new Discord.MessageEmbed()
      .addField('\u200B', nocatList)
      .addFields(...catsFields);

    if (target) {
      if (target === 'me') {
        listMessage.setDescription(`Canais que ${message.author} participa`);
      } else if (
        target.match(/^<@!?(\d+)>$/) &&
        message.mentions.members.first()
      ) {
        listMessage.setDescription(
          `Canais que ${message.mentions.members.first()} participa`,
        );
      }
    } else {
      listMessage.setTitle('Lista de canais no servidor');
    }

    message.channel.send(listMessage);
  },

  join: (message, args) => {
    const { prefix } = message.client.config;
    const target = args.shift();

    if (target && target.match(/^#(\d-+)$/)) {
      const channel = message.guild.channels.find((c) => c.name === target);

      if (
        channel ||
        !channel
          .permissionsFor(message.author)
          .has(Discord.Permissions.FLAGS.VIEW_CHANNEL)
      ) {
        channel
          .createOverwrite(message.author, {
            VIEW_CHANNEL: true,
          })
          .then((c) => c.send(`Deem boas vindas a ${message.author}`))
          .catch(console.error);
      } else {
        message.reply('Este canal não está disponível');
      }
    } else {
      message
        .reply(`\`\`${prefix}${name} join ${target}\`\` não é uma opção válida`)
        .then((m) => m.react('❌'));
    }
  },

  leave: (message, _) => {
    if (message.channel.parentID) {
      const channel = message.channel;

      if (
        channel
          .permissionsFor(message.author)
          .has(Discord.Permissions.FLAGS.VIEW_CHANNEL)
      ) {
        channel
          .createOverwrite(message.author, {
            VIEW_CHANNEL: null,
          })
          .then((c) => c.send(`${message.author} já vai indo`))
          .catch(console.error);
      }
    } else {
      message
        .reply('Você não pode sair deste canal')
        .then((m) => m.react('❌'));
    }
  },
};

module.exports = {
  name: name,
  description: description,
  execute(message, args) {
    const config = message.client.config;

    const command = args.shift();
    if (!command) {
      options.ajuda(message, args);
    } else if (options[command]) {
      options[command](message, args);
    } else {
      message
        .reply(`${config.prefix}${name} ${command} não é uma opção válida`)
        .then((m) => m.react('❌'));
    }
  },
};
