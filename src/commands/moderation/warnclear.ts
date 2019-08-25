import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildMember } from 'discord.js';
import Util from '../../util/Util';

export default class WarnClear extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1010,
			description: 'Clears all warnings from the inputted member.',
			aliases: new Set(['warnc', 'clearwarnings', 'cwarns', 'cwarnings']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username whose warnings you would like to clear.' }
			}],
			userPerms: { flags: 'ADMINISTRATOR' },
			examples: { '{member}': 'clears all warnings from the mentioned member' }
		});
	}

	public async run(this: HavocClient, { msg, target: { member } }: { msg: HavocMessage; target: { member: GuildMember } }) {
		let response;
		const tag = member.user.tag;
		const role = member.roles.highest;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to clear warnings from this member.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `${tag} has the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to clear warnings from this member.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.respond(response);
		}
		this.db.category = 'warn';
		const key = member.id + msg.guild.id;
		const amount = (await this.db.get(key) || []).length;
		if (!amount) {
			return msg.respond(`\`${member.user.tag}\` doesn't have any warnings in this server.`);
		}
		await this.db.delete(key);
		msg.respond(`I have cleared ${amount} ${Util.plural('warning', amount)} from \`${member.user.tag}\`.`);
		msg.guild.modlog(msg, member);
	}
}
