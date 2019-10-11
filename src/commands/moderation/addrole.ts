import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildMember, Role } from 'discord.js';

export default class AddRole extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1010,
			description: 'Adds the inputted role to a member.',
			aliases: new Set(['ar', 'sr']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to add a role to.' }
			},
			{
				type: 'role',
				prompt: { initialMsg: 'mention the role / enter the role\'s ID or name that you would like to add to the member.' }
			},
			{
				optional: true,
				key: 'reason',
				type: 'string',
				prompt: { initialMsg: 'enter the reason for adding this role.' }
			}],
			userPerms: { flags: 'MANAGE_ROLES' },
			examples: {
				'{member} {role}': 'adds the corresponding role to the mentioned member',
				'{user} {role} very important': 'adds the corresponding role to the mentioned member with the reason "very important"'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { member, role, reason } }: { msg: HavocMessage; target: { member: GuildMember; role: Role; reason: string } }) {
		let response;
		const tag = member.user.tag;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `the role \`${role.name}\` has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to add this role to ${tag}.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `the role \`${role.name}\` has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to add this role to ${tag}.`;
		}
		if (member.roles.has(role.id)) {
			response = `${tag} already has the \`${role.name}\` role.`;
		}
		if (response) {
			return msg.respond(response);
		}
		await member.roles.add(role, `Added by ${msg.author.tag}${reason ? ` for the reason ${reason}` : ''}`);
		msg.respond(`I have added the role \`${role.name}\` to ${tag}${reason ? ` for the reason \`${reason}\`` : ''}.`);
	}
}
