import { User, GuildMember, TextChannel, MessageMentions, GuildEmoji, Role } from 'discord.js';
import { Emoji, find } from 'node-emoji';
import Command, { TargetType } from '../structures/bases/Command';
import HavocGuild from '../extensions/Guild';
import Regex from './Regex';
import HavocMessage from '../extensions/Message';
import Time from './Time';
import HavocTextChannel from '../extensions/TextChannel';

export default {
	member: {
		async mentionOrIDSearch(str: string, guild: HavocGuild) {
			if (!str) return null;
			const target = (str.match(`(${MessageMentions.USERS_PATTERN})|(${Regex.id.source})`) || [])[0];
			if (!target) return null;
			const [id]: RegExpMatchArray = target.match(/\d+/)!;
			return guild.members.fetch(id).catch(() => null);
		},

		async nameSearch(str: string, guild: HavocGuild) {
			if (!str) return null;
			const f = (member: GuildMember) => ['tag', 'username'].some(e => member.user[e].toLowerCase() === str);
			return guild.members.find(member => f(member)) ||
				guild.members.fetch().then(members => members.find(member => f(member) || member.displayName.toLowerCase() === str) || null)
					.catch(() => null) || null;
		},

		async looseSearch(str: string, guild: HavocGuild) {
			if (!str) return null;
			str = str.toLowerCase();
			return guild.members.find(member =>
				member.displayName.toLowerCase().startsWith(str) || member.user.username.toLowerCase().startsWith(str) ||
					member.displayName.toLowerCase().includes(str) || member.user.username.toLowerCase().includes(str)) || null;
		}
	},

	emoji: {
		get(str: string, guild: HavocGuild) {
			if (!str) return null;
			const emojiID = (str.match(Regex.emoji) || [])[1] || (str.match(Regex.id) || [])[0];
			return guild.emojis.get(emojiID) || find(str);
		}
	},

	role: {
		get(str: string, msg: HavocMessage) {
			if (!str) return null;
			return this.mentionOrIDSearch(str, msg) || this.nameSearch(str, msg);
		},

		mentionOrIDSearch(str: string, msg: HavocMessage) {
			if (!str) return null;
			const target = (str.match(MessageMentions.ROLES_PATTERN) || [])[0];
			if (!target) return null;
			const [id]: RegExpMatchArray = target.match(/\d+/)!;
			msg.args.shift();
			return msg.guild.roles.get(id);
		},

		nameSearch(str: string, msg: HavocMessage) {
			if (!str) return null;
			return str.split(' ').reduce((foundRole: Role | null, _: any, i: number, arr: string[]): Role | null => {
				if (foundRole) return foundRole;
				const possibleRoleName = arr.slice(0, i + 1).join(' ');
				const possibleRole = msg.guild.roles.find(role => role.name === possibleRoleName || role.name.toLowerCase() === possibleRoleName.toLowerCase());
				if (possibleRole) msg.args.splice(0, i + 1);
				return possibleRole || foundRole;
			}, null);
		}
	},

	async getTarget(type: TargetType, msg: HavocMessage, optional: boolean | undefined) {
		const text = type === 'string' || type === 'role' || type === 'tagName' ? msg.text : msg.arg;
		const guild = msg.guild;
		let target = null;
		let loose = null;
		if (typeof type === 'function') {
			target = await (type as Function)(msg);
			if (!target && target !== false) target = null;
			type = target;
		}
		switch (type) {
			case 'string':
				if (text) target = text;
				break;
			case 'command':
				target = guild.client.commands.handler.get(text)!;
				break;
			case 'emoji':
				target = this.emoji.get(text, guild);
				break;
			case 'role':
				target = this.role.get(text, msg);
				break;
			case 'number':
				target = Number(text);
				break;
			case 'time':
				target = Time.parse(text);
				break;
			case 'id':
				if (Regex.id.test(text)) target = text;
				break;
			case 'channel':
				target = msg.mentions.channels.first() || guild.channels.find(c => c.name.toLowerCase() === text.toLowerCase()) || guild.channels.get(text) as HavocTextChannel;
				break;
			case 'tagName':
				if (Regex.tagName.test(text)) {
					[, target] = text.match(Regex.tagName) as RegExpMatchArray;
				} else if ((msg.channel as HavocTextChannel).prompts.has(msg.author.id)) {
					target = text;
				} else {
					target = text.split(' ')[0];
				}
				msg.args.splice(0, target.split(' ').length);
			default:
				if (type === 'user' || type === 'member') {
					target = await this.member.mentionOrIDSearch(text, guild) || await this.member.nameSearch(text, guild);
					if (!target) {
						target = await this.member.looseSearch(text, guild);
						loose = text;
					}
				}
				if (type === 'user') target = await guild.client.users.fetch(target ? target.id : text);
				break;
		}
		if (optional && target === null) target = false;
		if (target && type !== 'role' && type !== 'tagName') msg.args.shift();
		return { target, loose };
	},

	assignTarget(msg: HavocMessage, type: TargetType, target: Target, loose: string | null, targetObj: { [key: string]: Target }, key?: string) {
		if (!key) key = typeof type === 'function' ? 'target' : type;
		targetObj[key] = target;
		targetObj.loose = loose;
		if (!targetObj[key] && !(msg.command.opts & (1 << 3))) targetObj.target = msg[type === 'user' ? 'author' : 'member'];
	},

	async parseTarget(msg: HavocMessage) {
		const targetObj: { [key: string]: Target } = {};
		for (const arg of msg.command.args!) {
			const { key, type, optional } = arg;
			await this.getTarget(type, msg, optional)
				.then(async ({ target, loose }) => this.assignTarget(msg, type, target, loose, targetObj, key))
				.catch(() => null);
		}
		return targetObj;
	}
};

declare module 'discord.js' {
	interface User {
		[key: string]: any;
	}
}

export type Target = Function | User | GuildMember | TextChannel | GuildEmoji | Emoji | Command | Role | string | number | null;
