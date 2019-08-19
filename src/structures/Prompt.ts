import { MessageCollector } from 'discord.js';
import { EventEmitter } from 'events';
import HavocMessage from '../extensions/Message';
import Targetter, { Target } from '../util/Targetter';
import { TargetType } from './bases/Command';
import Responses from '../util/Responses';
import Util from '../util/Util';
import HavocTextChannel from '../extensions/TextChannel';

export default class Prompt extends EventEmitter {
	private msg: HavocMessage;

	private promptEmbed?: HavocMessage;

	private initialMsg: string[] | Function[];

	private invalidResponseMsg?: (undefined | string)[];

	private timeLimit: number;

	private target?: (Function | TargetType | undefined)[];

	private promptMessages: string[] = [];

	private responses: Promise<{
		target: Target;
		loose: string | null;
	}>[] = [];

	private timeLeft!: number;

	private timeEdits!: NodeJS.Timeout;

	private hastebin!: { url: string; text: string };

	private index: number

	private files?: { attachment: Buffer; name: string }[];

	public constructor(options: PromptOptions) {
		super();
		this.msg = options.msg;
		this.initialMsg = Util.arrayify(options.initialMsg || '');
		this.invalidResponseMsg = Util.arrayify(options.invalidResponseMsg || []);
		this.timeLimit = options.timeLimit || 30000;
		this.target = Util.arrayify(options.target || []);
		this.index = 0;
		this.files = options.files;
		this.create();
	}


	private async create() {
		(this.msg.channel as HavocTextChannel).prompts.add(this.msg.author.id);
		const initialMsg = this.initialMsg.shift();
		this.promptEmbed = await this.msg.sendEmbed({
			setDescription: `**${this.msg.author.tag}** ${typeof initialMsg === 'function' ? initialMsg(this.msg) : initialMsg}`,
			setFooter: [`You have ${this.timeLimit / 1000} seconds left to enter an option.`]
		}, '', this.files);
		this.promptMessages.push(this.promptEmbed!.id);
		this.collect(
			this.msg.channel.createMessageCollector(
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
			.on('collect', async (msg: HavocMessage) => {
				this.promptMessages.push(msg.id);
				if (msg.content.toLowerCase() === 'cancel') {
					this.msg.react('❌');
					return collector.stop();
				}
				this.msg.promptResponses.add(msg.content.toLowerCase());
				msg.intialMsg = this.msg;
				const targetObj = Targetter.getTarget(this.target![this.index]! as TargetType, msg);
				const { target } = await targetObj;
				if (target || target === null) {
					collector.stop();
					this.responses.push(targetObj);
					this.index++;
				} else {
					return this.invalidResponse(msg);
				}
				if (this.initialMsg.length) {
					this.create();
				} else {
					await this.msg.channel.bulkDelete(this.promptMessages);
					(this.msg.channel as HavocTextChannel).prompts.delete(this.msg.author.id);
					this.emit('promptResponse', this.responses);
				}
			})
			.on('end', async (_, reason) => {
				clearInterval(this.timeEdits);
				await this.msg.channel.bulkDelete(this.promptMessages);
				(this.msg.channel as HavocTextChannel).prompts.delete(this.msg.author.id);
				if (reason === 'time') {
					this.msg.react('⏱');
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

	private async invalidResponse(msg: HavocMessage) {
		// eslint-disable-next-line promise/catch-or-return
		this.msg.sendEmbed({
			setDescription: `**${this.msg.author.tag}** \`${msg.content}\` is an invalid option!\n${this.invalidResponseMsg![this.index] || Responses[typeof this.target![this.index] === 'function' ? (this.target![this.index] as Function)(msg) : this.target![this.index]](msg)}\nEnter \`cancel\` to exit out of this prompt.`
		}).then(m => this.promptMessages.push(m!.id));
	}
}

export interface PromptOptions {
	msg: HavocMessage;
	initialMsg?: string | string[] | Function;
	invalidResponseMsg?: string | (string | undefined)[];
	target?: Function | TargetType | (Function | TargetType | undefined)[];
	timeLimit?: number;
	files?: { attachment: Buffer; name: string }[];
}
