import { Message, TextChannel, MessageEmbed } from 'discord.js';
import Regex from '../util/Regex';
import HavocGuild from './Guild';
import Command from '../structures/bases/Command';
import HavocUser from './User';
import Util from '../util/Util';
import HavocClient from '../client/Havoc';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require('../../config.json');

export default class HavocMessage extends Message {
	public client!: HavocClient

	public author!: HavocUser;

	public guild!: HavocGuild;

	public prefix!: string;

	public command!: Command

	public args!: string[];

	public text!: string;

	public mentionPrefix!: boolean;

	public response?: HavocMessage;

	public prompt!: boolean;

	public _patch(data: object) {
		super._patch(data);
		this._init();
	}

	public constructEmbed(methods: { [key: string]: any }): MessageEmbed {
		const embed = new MessageEmbed()
			.setColor(this.guild ? this.member!.displayColor || 'WHITE' : '')
			.setTimestamp();
		Object.keys(methods).forEach(method => {
			const val = methods[method];
			if (Array.isArray(val)) {
				Array.isArray(val[0]) ? val.map((v): MessageEmbed => embed[method](...v)) : embed[method](...val);
			} else {
				embed[method](val);
			}
		});
		if (!methods.setFooter && (!embed.description || !embed.description.includes(this.author!.tag))) {
			embed.setFooter(`Requested by ${this.author!.tag}`, this.author!.pfp);
		}
		return embed;
	}

	public async sendEmbed(methodsOrEmbed: { [key: string]: any } | MessageEmbed, content?: string) {
		if (this.guild && !(this.channel as TextChannel).permissionsFor(this.guild.me!)!.has('EMBED_LINKS')) {
			return this.response = await this.channel.send(`**${this.author}** I require the \`Embed Links\` permission to execute this command.`) as HavocMessage;
		}
		const embed = await this.channel.send(
			content,
			methodsOrEmbed instanceof MessageEmbed
				? methodsOrEmbed
				: this.constructEmbed(methodsOrEmbed)
		) as HavocMessage;
		if (this.command.opts & 1) {
			await embed.react('🗑');
			embed.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === this.author.id,
				{
					time: 1800,
					max: 1,
					errors: ['time']
				}
			).then(async () => {
				await embed.delete();
				if (this.guild) this.delete();
			}).catch(() => {
				if (!embed.deleted) embed.reactions.get('🗑')!.users.remove(embed.author);
			});
		}
		return embed;
	}

	public async endPoll(options: number) {
		const emojiObj = Util.emojiNumbers;
		const reactionCount = new Map();
		const totalReactions = await this.reactions.reduce(async (total, reaction) => {
			total = await total;
			if (Number(Object.keys(emojiObj).find(emoji => emojiObj[emoji] === reaction.emoji.name)!) <= options) {
				const count = reaction.count - ((await reaction.users.fetch()).has(this.client.user!.id) ? 1 : 0);
				reactionCount.set(reaction.emoji.name, count);
				total += count;
			}
			return total;
		}, 0);
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

	private _init() {
		this.prefix = this._prefix;
		this.mentionPrefix = Regex.mentionPrefix(this.client.user!.id).test(this.prefix);
		this.args = this.content.substring(this.prefix.length).split(/ +/);
		this.text = this.args.slice(1).join(' ');
	}

	private get _prefix() {
		if (!this.guild) return prefix;
		const [matchedPrefix]: RegExpMatchArray = this.content.match(Regex.prefix(this.client.user!.id, this.guild.prefix)) || [prefix];
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
