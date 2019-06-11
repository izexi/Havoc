import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { Util as djsUtil, Role } from 'discord.js';
import Util from '../../util/Util';
import * as moment from 'moment';
import HavocUser from '../../extensions/User';

export default class Ping extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View info about a user.',
			aliases: new Set(['uinfo', 'user']),
			args: [{ type: 'user' }]
		});
	}

	public async run(this: HavocClient, { msg, target: { user } }: { msg: HavocMessage; target: { user: HavocUser } }) {
		const fields = [
			['❯Tag', user.tag, true],
			['❯ID', user.id, true],
			['❯Status', Util.captialise(user.presence.status), true]
		];
		if (msg.guild) {
			const member = await msg.guild.members.fetch(user);
			fields.push(['❯Joined server at', moment(member.joinedAt!).format('LLLL'), true]);
			if (member.roles.size > 1) {
				fields.push(['Roles',
					member.roles
						.filter((role: Role) => role.id !== msg.guild.id)
						.sort((a: Role, b: Role) => b.position - a.position)
						.map((role: Role) => role.toString())
						.join(', '),
					true]);
			}
		}
		if (user.presence.activity) fields.push(['❯Activity', user.presence.activity.name, true]);
		msg.response = await msg.sendEmbed({
			setThumbnail: user.pfp,
			addField: fields
		}, msg.text && !user
			? `I couldn't find \`${djsUtil.cleanContent(msg.text, msg)}\`... so here's yours?`
			: '');
	}
}
