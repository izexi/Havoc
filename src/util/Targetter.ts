import { User, GuildMember, TextChannel, MessageMentions, GuildEmoji, Role } from 'discord.js';
import { Emoji, find } from 'node-emoji';
import Command, { TargetType } from '../structures/bases/Command';
import HavocGuild from '../extensions/Guild';
import Regex from './Regex';

export default {
	member: {
		async mentionOrIDSearch(str: string, guild: HavocGuild) {
			const target = (str.match(`(${MessageMentions.USERS_PATTERN})|(${Regex.id.source})`) || [])[0];
			if (!target) return null;
			const [id]: RegExpMatchArray = target.match(/\d+/)!;
			return guild.members.fetch(id).catch(() => null);
		},

		async nameSearch(str: string, guild: HavocGuild) {
			const target = (str.match(`(${Regex.user.tag.source})|(${Regex.user.username.source})`) || [])[0];
			if (!target) return null;
			const f = (member: GuildMember) => ['tag', 'username'].some(e => member.user[e].toLowerCase() === str);
			return guild.members.find(member => f(member)) ||
				guild.members.fetch().then(members => members.find(member => f(member) || member.displayName.toLowerCase() === str) || null)
					.catch(() => null) || null;
		},

		async looseSearch(str: string, guild: HavocGuild) {
			return guild.members.find(member =>
				member.displayName.toLowerCase().includes(str) ||
					member.user.username.toLowerCase().includes(str)) || null;
		}
	},

	emoji: {
		get(str: string, guild: HavocGuild): GuildEmoji | Emoji {
			const emojiID = (str.match(Regex.emoji) || [])[1] || (str.match(Regex.id) || [])[0];
			return guild.emojis.get(emojiID) || find(str);
		}
	},

	role: {
		get(str: string, guild: HavocGuild) {
			return this.mentionOrIDSearch(str, guild) || this.nameSearch(str, guild);
		},

		mentionOrIDSearch(str: string, guild: HavocGuild) {
			const target = (str.match(MessageMentions.ROLES_PATTERN) || [])[0];
			if (!target) return null;
			const [id]: RegExpMatchArray = target.match(/\d+/)!;
			return guild.roles.get(id);
		},

		nameSearch(str: string, guild: HavocGuild) {
			return str.split(' ').reduce((foundRole: Role | null, _: any, i: number, arr: string[]): Role | null => {
				if (foundRole) return foundRole;
				const possibleRoleName = arr.slice(0, i + 1).join(' ');
				const possibleRole = guild.roles.find(role => role.name === possibleRoleName || role.name.toLowerCase() === possibleRoleName.toLowerCase());
				if (possibleRole) foundRole = possibleRole;
				return foundRole;
			}, null);
		}
	},

	async getTarget({ str, guild, type }: { str: string; guild: HavocGuild; type: TargetType }) {
		if (!str) return { target: null };
		const targetObj: Target = {};
		if (type === 'string') {
			targetObj.target = str;
		} else if (type === 'command') {
			targetObj.target = guild.client.commands.handler.get(str);
		} else if (guild && (type === 'member' || type === 'user')) {
			targetObj.target = await this.member.mentionOrIDSearch(str, guild) || await this.member.nameSearch(str, guild);
			if (!targetObj.target) {
				targetObj.target = await this.member.looseSearch(str, guild);
				targetObj.loose = true;
			}
			if (targetObj.target && type === 'user') targetObj.target = await guild.client.users.fetch(targetObj.target.id);
		} else {
			targetObj.target = (this as { [key: string]: any })[type].get(str, guild);
		}
		return targetObj;
	}
};

declare module 'discord.js' {
	interface User {
		[key: string]: any;
	}
}

export interface Target {
	target?: User | GuildMember | TextChannel | GuildEmoji | Emoji | Command | Role | string | null;
	loose?: boolean;
}
