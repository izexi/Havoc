import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { GuildMember, Role } from 'discord.js';

export default class RemoveRole extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Removes the inputted role to a member.',
			aliases: new Set(['rr']),
			args: [{
				type: 'member',
				prompt: { initialMsg: 'mention the user / enter the users\'s ID, tag, nickname or username who you would like to remove a role from.' }
			},
			{
				type: 'role',
				prompt: { initialMsg: 'mention the role / enter the role\'s ID or name that you would like to remove from the member.' }
			}],
			userPerms: { flags: 'MANAGE_ROLES' }
		});
	}

	public async run(this: HavocClient, { msg, target: { member, role, loose } }: { msg: HavocMessage; target: { member: GuildMember; role: Role; loose?: string } }) {
		let response;
		const tag = loose ? member.user.tag.replace(new RegExp(loose, 'gi'), '**$&**') : member.user.tag;
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `the role \`${role.name}\` has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to remove this role from ${tag}.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `the role \`${role.name}\` has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to remove this role from ${tag}.`;
		}
		if (!member.roles.has(role.id)) {
			response = `${tag} doesn't even have the \`${role.name}\` role.`;
		}
		if (response) {
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		await member.roles.remove(role, `Removed by ${msg.author.tag}`);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have removed the role \`${role.name}\` from ${tag}.` });
	}
}
