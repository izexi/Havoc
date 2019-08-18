import { Message, TextChannel, MessageEmbed, MessageReaction, EmojiResolvable } from 'discord.js';
import Regex from '../util/Regex';
import HavocGuild from './Guild';
import Command from '../structures/bases/Command';
import HavocUser from './User';
import Util from '../util/Util';
import HavocClient from '../client/Havoc';
import Prompt, { PromptOptions } from '../structures/Prompt';
import HavocTextChannel from './TextChannel';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require('../../config.json');

export default class HavocMessage extends Message {
	public client!: HavocClient

	public author!: HavocUser;

	public guild!: HavocGuild;

	public command!: Command

	public args!: string[];

	public mentionPrefix!: boolean;

	public response?: HavocMessage;

	public prompt!: boolean;

	public intialMsg!: HavocMessage;

	public promptResponses: Set<string> = new Set();

	public validArgs: Set<string> = new Set();

	public _patch(data: object) {
		super._patch(data);
		this._init();
	}

	public async react(emoji: EmojiResolvable): Promise<any> {
		if (this.deleted || (this.channel.type === 'text' && !(this.channel as HavocTextChannel).permissionsFor(this.guild.me!)!.has('ADD_REACTIONS'))) return null;
		return super.react(emoji);
	}

	public constructEmbed(methods: { [key: string]: any }): MessageEmbed {
		const embed = new MessageEmbed()
			.setColor(this.guild ? this.member!.displayColor || 'WHITE' : '')
			.setTimestamp();
		if (methods.setDescription) {
			const [image]: RegExpMatchArray = methods.setDescription.match(/\bhttps:\/\/i\.imgur\.com\/[^\s]+/) || [];
			if (image) {
				methods.setDescription = methods.setDescription.replace(image, '');
				methods.setImage = image;
			}
		}
		Object.keys(methods).forEach(method => {
			const val = methods[method];
			if (Array.isArray(val)) {
				Array.isArray(val[0]) ? val.map((v): MessageEmbed => embed[method](...v)) : embed[method](...val);
			} else {
				embed[method](val);
			}
		});
		if (!methods.setFooter && (!embed.footer || !embed.footer.text) && (!embed.description || !embed.description.includes(this.author!.tag)) && this.author.id !== this.client.user!.id) {
			embed.setFooter(`Requested by ${this.author!.tag}`, this.author!.pfp);
		}
		return embed;
	}

	public async sendEmbed(methodsOrEmbed: { [key: string]: any } | MessageEmbed, content?: string, files?: { attachment: Buffer; name?: string }[]) {
		if (this.guild && !(this.channel as TextChannel).permissionsFor(this.guild.me!)!.has('EMBED_LINKS')) {
			return this.response = await this.channel.send(`**${this.author}** I require the \`Embed Links\` permission to execute this command.`) as HavocMessage;
		}
		const embed = await this.channel.send({
			content,
			files,
			embed: methodsOrEmbed instanceof MessageEmbed
				? methodsOrEmbed
				: this.constructEmbed(methodsOrEmbed)
		}) as HavocMessage;
		if (this.command && this.command.opts & 1) {
			await embed.react('🗑');
			embed.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === this.author.id,
				{
					time: 2300,
					max: 1,
					errors: ['time']
				}
			).then(async () => {
				this.guild ? this.channel.bulkDelete([embed, this]) : embed.delete();
			}).catch(() => {
				if (!embed.deleted) embed.reactions.get('🗑')!.users.remove(embed.author);
			});
		}
		return embed;
	}

	public async endPoll(options: number) {
		const emojiObj = Util.emojiNumbers;
		const reactionCount = new Map();
		const totalReactions = await this.reactions.reduce(async (total: Promise<number>, reaction: MessageReaction) => {
			if (Number(Object.keys(emojiObj).find(emoji => emojiObj[emoji] === reaction.emoji.name)!) <= options) {
				const count = reaction.count - ((await reaction.users.fetch()).has(this.client.user!.id) ? 1 : 0);
				reactionCount.set(reaction.emoji.name, count);
				total = Promise.resolve((await total) + count);
			}
			return total;
		}, Promise.resolve(0));
		await this.reactions.removeAll();
		const oldDesc = this.embeds[0].description.split('\n');
		const newDesc = oldDesc.slice(2).reduce((desc, opt) => {
			const reacationCount = reactionCount.get(Object.values(emojiObj).find(emoji => opt.includes(emoji)));
			desc.push(
				`${opt} - **${((reacationCount / totalReactions) * 100 || 0).toFixed(2).replace(/\.00/, '')
				}% (${reacationCount})**`
			);
			return desc;
		}, oldDesc.slice(0, 2));
		await this.edit(
			this.embeds[0]
				.setFooter('Poll ended at:')
				.setTimestamp(new Date())
				.setDescription(newDesc.join('\n'))
		);
	}

	public async endGiveaway(winners: number) {
		if (this.embeds[0].footer!.text!.includes('ended')) return;
		const reaction = this.reactions.get('🎉');
		if (!reaction) return;
		const winner = (await reaction.users.fetch())
			.filter(user => user.id !== this.client.user!.id)
			.random(winners)
			.filter(user => user);
		if (!winner.length) {
			return this.edit('🎉 **GIVEAWAY ENDED** 🎉',
				this.embeds[0]
					.setDescription(`**Winner:** Could not be determined`)
					.setFooter(`Giveaway ID: ${this.embeds[0].footer!.text!.match(Regex.id)![0]} | Giveaway ended at:`)
					.setColor('RED')
					.setTimestamp(new Date()));
		}
		await this.edit('🎉 **GIVEAWAY ENDED** 🎉',
			this.embeds[0]
				.setDescription(`**${Util.plural('Winner', winner.length)}:** ${winner.map(u => u.tag).join(', ')}`)
				.setFooter(`Giveaway ID: ${this.embeds[0].footer!.text!.match(Regex.id)![0]} | Giveaway ended at:`)
				.setColor('RED')
				.setTimestamp(new Date()));
		const embed = this.constructEmbed({
			setDescription: `🎉 Congratulations **${winner.map(u => u.tag).join(', ')}**! You won the [giveaway](${this.url}) for ${this.embeds[0].title} 🎉`,
			setColor: 'GOLD'
		});
		await this.sendEmbed(embed, winner.map(u => u.toString()).join(', '));
		Promise.all(winner.map(async u => {
			const dmEmbed = new MessageEmbed(this.embeds[0])
				.setColor('GOLD')
				.setDescription(`🎉 Congratulations **${u.tag}**! You won the [giveaway](${this.url}) for **${this.embeds[0].title}** 🎉`);
			delete dmEmbed.footer;
			delete dmEmbed.title;
			return u.send(dmEmbed).catch(() => null);
		})).catch(() => null);
	}

	public async createPrompt({ msg, initialMsg, invalidResponseMsg, target }: PromptOptions) {
		return new Promise(resolve =>
			new Prompt({ msg, initialMsg, invalidResponseMsg, target })
				.on('promptResponse', responses => resolve(responses)));
	}

	public get text() {
		return this.args.join(' ');
	}

	public get arg() {
		return (this.args[0] || '').toLowerCase();
	}

	private _init() {
		this.mentionPrefix = Regex.mentionPrefix(this.client.user!.id).test(this.prefix);
		this.args = this.content.split(/ +/);
	}

	public get defaultPrefix() {
		return prefix;
	}

	public get prefix() {
		if (!this.guild) return prefix;
		const [matchedPrefix]: RegExpMatchArray = this.content.match(Regex.prefix(this.client.user!.id, this.guild.prefix || this.defaultPrefix)) || [];
		return matchedPrefix;
	}
}

declare module 'discord.js' {
	interface Message {
		_patch(data: object): void;
	}

	interface MessageEmbed {
		[key: string]: any;
	}
}
