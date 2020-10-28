const Discord = require('discord.js')
const { createCanvas, loadImage } = require('canvas')

const name = 'game'
const description = 'Jogo'

const canvasWidth = 896
const canvasHeight = 480

class SpriteSheet {
	constructor(image, width, height=width) {
		this.image = image;
		this.width = width;
		this.height = height;
	}

	cropSprite(x, y, w=1, h=1, proportion=1) {

		const buffer = createCanvas(this.width * w * proportion, this.height * h * proportion)
		buffer.getContext('2d')
			.drawImage(this.image,
				x * this.width, y * this.height, w * this.width, h * this.height,
				0, 0, this.width * w * proportion, this.height * h * proportion);
		return buffer;
	}
}

function drawImage(ctx, x, y, image) {
	ctx.save()
		ctx.translate(x, y)
		ctx.drawImage(image, image.width/(-2), image.height/(-2));
	ctx.restore()
}

function fillText(ctx, x, y, text, color, base) {
	ctx.font = '18px Consolas'
	ctx.fillStyle = color;
	ctx.textAlign = 'center';
	ctx.textBaseline = base;

	ctx.fillText(text, x, y);
}

function drawShadow(ctx, x, y, r) {
	
	ctx.save()
		const grad = ctx.createRadialGradient(calcX(x, y), (calcY(x, y)+16)*2, 16, calcX(x, y), (calcY(x, y)+16)*2, r*16)
		grad.addColorStop(0, "rgba(0, 0, 0, 0)")
		grad.addColorStop(1, "rgba(0, 0, 0, 0.9)")

		ctx.scale(1, 0.5)
		ctx.fillStyle = grad
		ctx.fillRect(0, 0, canvasWidth*2, canvasHeight*2);
	ctx.restore()
}

function calcX(x, y) {
	return canvasWidth/2 + x*32 - y*32
}

function calcY(x, y) {
	return 64 + y*16 + x*16
}

const getMax = object => {
	return Object.keys(object).filter(x => {
		 return object[x] == Math.max.apply(null, 
		 Object.values(object));
   });
};

module.exports = {
	name: name,
	description: description,
	cache: {},
	state: {},
	execute: function (message, args) {

		const option = args.shift()
		if (option === "start") {
			if (!message.client.state.game) {
				const placeName = args.shift() || 'normal'
				this.state.placeName = placeName
				this.state.player = {x: 5, y: 5, sprite: 0}
				this.state.channel = message.channel
				message.client.state.game = {
					votes: { 'A': 0, 'B': 0, 'C': 0, 'D': 0 },
					alreadyVoted: [],
				}

				this.gameloop()
			} else {
				message.channel.send('O jogo já está executando!')
			}
			
		} else if (option === "stop" && this.state.gameloop) {
			clearInterval(this.state.gameloop)
			delete this.state.gameloop
			delete message.client.state.game
			message.channel.send('Fim de jogo')

		} else if (option === "ajuda") {
			message.channel.send('Como jogar: este é um jogo de turnos, a cada turno os membros do servidor podem votar entre as ações disponíveis. No fim do período do turno, a ação com mais voto é a escolhida para ser executada. Se houver um empate, uma ação aleatória é executada. É isso...')
		}
	},
	gameloop: async function() {
		const tag = setInterval(async () => {
			// const options = 
				this.update()
			const frame = await this.draw()

			const attach = new Discord.MessageAttachment(frame, 'the-game.png')
			this.state.channel.send('', attach)
			this.state.channel.send("30 segundos para votar")
		}, 30000); 
		const frame = await this.draw()

		const attach = new Discord.MessageAttachment(frame, 'the-game.png')
		this.state.channel.send('', attach)
		this.state.channel.send("30 segundos para votar")

		this.state.gameloop = tag
	},
	update: function() {
		const clientState = this.state.channel.client.state

		const max = getMax(clientState.game.votes)
		const action = max[Math.floor(Math.random() * max.length)]
		
		switch (action) {
			case "A":
				this.state.player.x = this.state.player.x+1 <= 11 ? this.state.player.x+1 : this.state.player.x
				this.state.player.sprite = 1
				break;
			case "B":
				this.state.player.y = this.state.player.y+1 <= 11 ? this.state.player.y+1 : this.state.player.y
				this.state.player.sprite = 2
				break;
			case "C":
				this.state.player.x = this.state.player.x-1 >= 0 ? this.state.player.x-1 : this.state.player.x
				this.state.player.sprite = 3
				break;
			case "D":
				this.state.player.y = this.state.player.y-1 >= 0 ? this.state.player.y-1 : this.state.player.x
				this.state.player.sprite = 0
				break;
		}

		this.state.channel.client.state.game = {
			votes: { 'A': 0, 'B': 0, 'C': 0, 'D': 0 },
			alreadyVoted: [],
		}
	},
	draw: async function() {
		const playerState = this.state.player

		const canvas = createCanvas(canvasWidth, canvasHeight)
		const ctx = canvas.getContext('2d')
	
		const features = this.cache.features || await loadImage(`${__base}/assets/img/features.png`)
		const character = this.cache.character || await loadImage(`${__base}/assets/img/character2.png`)
		const place = this.cache.place || await loadImage(`${__base}/assets/img/${this.state.placeName}.png`)
		this.cache.features = features
		this.cache.character = character
		this.cache.place = place
		
		const featuresSheet = new SpriteSheet(features, 64)
		const characterSheet = new SpriteSheet(character, 64)
		const placeSheet = new SpriteSheet(place, 64)
	
		const player = characterSheet.cropSprite(playerState.sprite, 0)
		const enable = featuresSheet.cropSprite(7, 0)
	
		const tile = placeSheet.cropSprite(4, 2)
		const wallRight = placeSheet.cropSprite(7, 0)
		const walLeft = placeSheet.cropSprite(3, 1)
		const corner = placeSheet.cropSprite(4, 1)
		
		// BACKGROUND
		drawImage(ctx, canvasWidth/2, 32, corner)
		for (let x = 0; x < 13; x++) {
			drawImage(ctx, canvasWidth/2 +24 + x*32, 52 + x*16, walLeft)
			drawImage(ctx, canvasWidth/2 -24 - x*32, 52 + x*16, wallRight)
		}
		for (let x = 0; x < 12; x++) {
			for (let y = 0; y < 12; y++) {
				drawImage(ctx, calcX(x, y), calcY(x, y), tile)
			}
		}
		// ENDBACKGROUD
		
		drawImage(ctx, calcX(playerState.x, playerState.y), calcY(playerState.x, playerState.y), player)
						
		// FOREGROUND
		for (let x = 0; x < 13; x++) {
			drawImage(ctx, canvasWidth -32 -x*32, canvasHeight/2 +8 + x*16, wallRight)
			drawImage(ctx, 32 + x*32, canvasHeight/2 +8 + x*16, walLeft)
		}
		drawImage(ctx, canvasWidth/2, canvasHeight -32, corner)
		// END FOREGROUND
		
		// drawShadow(ctx, 5, 5, 6)
		ctx.globalAlpha = 0.23
		if (playerState.x-1 >= 0) {
			fillText(ctx, calcX(playerState.x-1, playerState.y), calcY(playerState.x-1, playerState.y), 'C', '#ff0', 'bottom')
			drawImage(ctx, calcX(playerState.x-1, playerState.y), calcY(playerState.x-1, playerState.y), enable)
		}
		if (playerState.y-1 >= 0) {
			fillText(ctx, calcX(playerState.x, playerState.y-1), calcY(playerState.x, playerState.y-1), 'D', '#ff0', 'bottom')
			drawImage(ctx, calcX(playerState.x, playerState.y-1), calcY(playerState.x, playerState.y-1), enable)
		}
		if (playerState.x+1 <= 11) {
			fillText(ctx, calcX(playerState.x+2, playerState.y+1), calcY(playerState.x+2, playerState.y+1), 'A', '#ff0', 'top')
			drawImage(ctx, calcX(playerState.x+1, playerState.y), calcY(playerState.x+1, playerState.y), enable)
		}
		if (playerState.y+1 <= 11) {
			fillText(ctx, calcX(playerState.x+1, playerState.y+2), calcY(playerState.x+1, playerState.y+2), 'B', '#ff0', 'top')
			drawImage(ctx, calcX(playerState.x, playerState.y+1), calcY(playerState.x, playerState.y+1), enable)
		}
		ctx.globalAlpha = 1
		
		return canvas.toBuffer()
	},
}