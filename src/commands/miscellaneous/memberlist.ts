import { Util as djsUtil, Role } from 'discord.js';
import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import EmbedPagination from '../../structures/EmbedPagination';
import Util from '../../util/Util';

export default class MemberList extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View a list of emojis on this server.',
			aliases: new Set(['ml', 'members', 'memberslist']),
			flags: new Set(['id', 'tag', 'username', 'nickname']),
			args: [{
				type: 'role',
				prompt: { initialMsg: 'mention the role / enter the role\'s name or ID that you would like to list members from.' }
			}]
		});
	}

	public async run(this: HavocClient, { msg, flag, target: { role } }: { msg: HavocMessage; flag: string; target: { role: Role } }) {
		const flagObj: { [key: string]: string[] } = {
			id: ['id'],
			tag: ['user', 'tag'],
			username: ['user', 'username'],
			nickname: ['displayName']
		};
		const roleMembers = await msg.guild.members.fetch()
			.then(members => members.filter(member => member.roles.has(role.id)))
			.catch(() => null);
		if (!roleMembers) {
			return msg.response = await msg.sendEmbed({
				setDescription: `${msg.author.tag} I encountered an error while trying to get a list of members that have the role \`${djsUtil.cleanContent(role.name, msg)}\`.`
			});
		}
		new EmbedPagination({
			msg,
			title: `List of ${roleMembers.size} ${Util.plural('member', roleMembers.size)} that have the role \`${role.name}\``,
			// eslint-disable-next-line @typescript-eslint/promise-function-async
			descriptions: roleMembers.map(member => `• ${(flagObj[flag] || ['displayName']).reduce((obj, option) => obj[option], member)}`),
			maxPerPage: 20
		});
	}
}

declare module 'discord.js' {
	interface GuildMember {
		[key: string]: any;
	}
}
