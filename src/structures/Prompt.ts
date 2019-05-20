import { MessageCollector } from 'discord.js';
import { EventEmitter } from 'events';
import HavocMessage from '../extensions/Message';

export default class Prompt extends EventEmitter {
	private msg: HavocMessage;

	private promptEmbed?: HavocMessage;

	private initialMsg: string[];

	private invalidResponseMsg?: string;

	private timeLimit: number;

	private validateFn: Function;

	private promptMessages: string[] = [];

	private responses: string[] = [];

	private timeLeft!: number;

	private timeEdits!: NodeJS.Timeout;

	private hastebin!: { url: string; text: string };

	public constructor(options: PromptOptions) {
		super();
		this.msg = options.msg;
		this.initialMsg = options.initialMsg.slice();
		this.invalidResponseMsg = options.invalidResponseMsg;
		this.timeLimit = options.timeLimit || 30000;
		this.validateFn = options.validateFn || (() => true);
		this.create();
	}


	private async create() {
		this.promptEmbed = await this.msg.sendEmbed({
			setDescription: `**${this.msg.author.tag}** ${this.initialMsg.shift()}`,
			setFooter: [`You have ${this.timeLimit / 1000} seconds left to enter an option.`]
		});
		this.promptMessages.push(this.promptEmbed!.id);
		this.collect(
			await this.msg.channel.createMessageCollector(
				msg => this.msg.author.id === msg.author.id, { time: this.timeLimit }
			)
		);
		this.timeLeft = this.timeLimit;
		this.timeEdits = setInterval(async () => {
			if (!this.timeLimit) return clearInterval(this.timeEdits);
			await this.promptEmbed!.edit(
				this.promptEmbed!.embeds[0].setFooter(`You have ${(this.timeLeft -= 5000) / 1000} seconds left to enter an option.`)
			);
		}, 5000);
	}

	private async collect(collector: MessageCollector) {
		collector
			.on('collect', (msg: HavocMessage) => {
				this.promptMessages.push(msg.id);
				if (msg.content.toLowerCase() === 'cancel') return collector.stop();
				if (this.validateFn(msg, msg.content)) {
					collector.stop();
					this.responses.push(msg.content);
					if (this.initialMsg.length) this.create();
					else this.emit('promptResponse', this.responses);
				} else {
					// eslint-disable-next-line promise/catch-or-return
					this.msg.sendEmbed({
						setDescription: `**${this.msg.author.tag}** \`${msg.content}\` is an invalid option!\n${this.invalidResponseMsg}\nEnter \`cancel\` to exit out of this prompt.`
					}).then(m => this.promptMessages.push(m!.id));
				}
			})
			.on('end', async (_, reason) => {
				clearInterval(this.timeEdits);
				await this.msg.channel.bulkDelete(this.promptMessages);
				if (reason === 'time') {
					this.msg.response = await this.msg.sendEmbed({
						setDescription: `**${this.msg.author.tag}** it have been over ${this.timeLimit / 1000} seconds and you did not enter a valid option, so I will go ahead and cancel this.`
					});
				}
				if (this.hastebin) {
					await this.promptEmbed!.edit(
						this.promptEmbed!.embeds[0].setDescription(`**${this.msg.author.tag}** click [here](${this.hastebin.url}) for ${this.hastebin.text}`)
					);
				}
			});
	}
}

export interface PromptOptions {
	msg: HavocMessage;
	initialMsg: string[];
	invalidResponseMsg?: string;
	validateFn?: Function;
	timeLimit?: number;
}
