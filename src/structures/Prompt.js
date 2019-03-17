const EventEmitter = require("events");
const { Collection } = require("discord.js");

/** @extends EventEmitter */
class Prompt extends EventEmitter {
	/**
	 * @param {Object} options
	 * @param {import("discord.js").Message} options.msg
	 * @param {string} options.initialMsg
	 * @param {string} options.invalidResponseMsg
	 * @param {number} [options.timeLimit = 30000]
	 * @param {Function} [options.validateFn = () => true]
	 */
	constructor(options) {
		super();
		this.msg = options.msg;
		this.initialMsg = options.initialMsg;
		this.invalidResponseMsg = options.invalidResponseMsg;
		this.timeLimit = options.timeLimit || 30000;
		this.validateFn = options.validateFn || (() => true);
		this.promptMessages = new Collection();
		this.responses = [];
		this.create();
	}

	async create() {
		this.promptEmbed = await this.msg.sendEmbed({
			setDescription: `**${this.msg.author.tag}** ${this.initialMsg.shift()}`,
			setFooter:[`You have ${this.timeLimit / 1000} seconds left to enter an option.`],
		});
		this.promptMessages.set(this.promptEmbed.id, this.promptEmbed);
		this.collect(
			await this.msg.channel.createMessageCollector(
				(msg) => this.msg.author.id === msg.author.id, { time: this.timeLimit }
			)
		);
		this.timeLeft = this.timeLimit;
		this.timeEdits = setInterval(async () => {
			if (!this.timeLimit) return clearInterval(this.timeEdits);
			await this.promptEmbed.edit(
				this.promptEmbed.embeds[0].setFooter(`You have ${(this.timeLeft -= 5000) / 1000} seconds left to enter an option.`)
			);
		}, 5000);
	}

	collect(collector) {
		collector
			.on("collect", (msg) => {
				this.promptMessages.set(msg.id, msg);
				if (this.validateFn(msg.content)) {
					collector.stop();
					this.responses.push(msg.content);
					if (this.initialMsg.length) this.create();
					else this.emit("promptResponse", this.responses);
				}
				else {
					this.msg.sendEmbed({
						setDescription: `**${this.msg.author.tag}** \`${msg.content}\` is an invalid option\n${this.invalidResponseMsg}`,
					}).then((m) => this.promptMessages.set(m.id, m));
				}
			})
			.on("end", async (_, reason) => {
				clearInterval(this.timeEdits);
				await this.msg.channel.bulkDelete(this.promptMessages);
				if (reason === "time") {
					this.msg.response = await this.msg.sendEmbed({
						setDescription: `**${this.msg.author.tag}** it have been over ${this.timeLimit / 1000} seconds and you did not enter a valid option, so I will go ahead and cancel this.`,
					});
				}
				if (this.hastebin) {
					await this.promptEmbed.edit(
						this.promptEmbed.embeds[0].setDescription(`**${this.msg.author.tag}** click [here](${this.hastebin.url}) for ${this.hastebin.text}`)
					);
				}
			});
	}

}

module.exports = Prompt;