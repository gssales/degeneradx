const name = 'spyfall'
const description = 'Jogo de Spyfall'

const locales = [
	{
		name: 'restaurante',
		roles: [
			'cliente idoso',
			'cozinheiro',
			'garçom',
			'gerente',
			'cliente criança',
			'crítico de restaurante',
		],
	},
	{
		name: 'museu',
		roles: [
			'visitante criança',
			'zelador',
			'segurança',
			'guia',
			'visitante',
			'historiador',
		],
	},
	{
		name: 'hospital',
		roles: [
			'paciente doente',
			'enfermeira',
			'médico cirurgião',
			'segurança',
			'visitante',
		],
	},
	{
		name: 'parque de diversões',
		roles: [
			'visitante',
			'visitante criança',
			'palhaço',
			'vendedor de doces',
			'atendente da montanha-russa',
		],
	},
	{
		name: 'faculdade',
		roles: [
			'estudante universitário',
			'professor idoso',
			'tia da limpeza',
			'bibliotecário',
			'esquerdista',
		],
	},
	{
		name: 'prisão',
		roles: [
			'guarda',
			'prisioneiro',
			'visitante',
			'prisioneiro no corredor da morte',
			'prisioneiro com um plano pra fuga',
		],
	},
	{
		name: 'estação de trem',
		roles: [
			'segurança',
			'vendedor de vagão',
			'trabalhador passageiro',
			'estudante passageiro',
			'vendedor de salgado',
		],
	},
	{
		name: 'galeria de arte',
		roles: [
			'crítico de arte',
			'guia da galeria',
			'zelador',
			'visitante',
			'visitante criança',
		],
	},
	{
		name: 'bar',
		roles: [
			'bartender',
			'universitário',
			'cliente muito bêbado',
			'cliente dançando',
			'segurança',
		],
	},
	{
		name: 'igreja',
		roles: [
			'padre',
			'coroinha',
			'banda gospel',
			'irmã freira',
			'visitante devoto',
		],
	},
]

module.exports = {
	name: name,
	description: description,
	execute(message, _) {
		const mentions = message.mentions.members.array()
		if (message.mentions.members.array().length >= 4) {
			const spy = Math.floor(Math.random() * mentions.length)
			const locale = locales[Math.floor(Math.random() * locales.length)]
			const roles = locale.roles.splice(0)

			mentions.forEach((member, index) => {
				if (index === spy) {
					member.send('VOCÊ É O ESPIÃO')
				} else {
					const role = roles.splice(Math.floor(Math.random() * roles.length), 1)
					member.send(`Você é o ${role}, e está em ${locale.name}`)
				}
			})
		}
	},
}
