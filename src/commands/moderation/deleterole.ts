import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { Role } from 'discord.js';

export default class DeleteRole extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1010,
			description: 'Deletes the inputted role.',
			aliases: new Set(['dr']),
			flags: new Set(['force', 'f']),
			args: [{
				type: 'role',
				prompt: { initialMsg: 'mention the role / enter the role\'s name or ID that you would like to list members from.' }
			},
			{
				optional: true,
				key: 'reason',
				type: 'string',
				prompt: { initialMsg: 'enter the reason for deleting this role.' }
			}],
			userPerms: { flags: 'MANAGE_ROLES' },
			examples: {
				'{role}': 'deletes the mentioned role',
				'{role} trash': 'deletes the mentioned role with the reason "trash"'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { role }, flag }: { msg: HavocMessage; target: { role: Role }; flag: string }) {
		let response;
		if (role.managed) {
			response = `the role \`${role.name}\` is a managed role, therefore I do not have permission to delete this role.`;
		}
		if (msg.guild.me!.roles.highest.comparePositionTo(role) < 1) {
			response = `the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${msg.guild.me!.roles.highest.name}\`, therefore I do not have permission to delete this role.`;
		}
		if (msg.member!.roles.highest.comparePositionTo(role) < 1 && msg.author.id !== msg.guild.ownerID) {
			response = `the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${msg.member!.roles.highest.name}\`, therefore you do not have permission to delete this role.`;
		}
		if (response) {
			await msg.react('⛔');
			return msg.respond(response);
		}
		await msg.react('464034357955395585');
		const members = (await msg.guild.members.fetch()).filter(m => m.roles.has(role.id));
		const deleteRole = async () => {
			await role.delete(`Deleted by ${msg.author.tag}`);
			msg.respond(`I have deleted the role \`${role.name}\`. 🗑`);
		};
		if (flag) return deleteRole();
		const confirm = await msg.confirmation(
			`delete the role \`${role.name}\` which will also remove the role from \`${members.size} member(s)\``,
			[{ attachment: Buffer.from(members.map(member => `${member.user.tag} | ${member.id}`).join('\r\n'), 'utf8'), name: `${members.size} members.txt` }]
		);
		if (confirm) deleteRole();
	}
}
