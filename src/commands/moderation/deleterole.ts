import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Prompt from '../../structures/Prompt';
import { Role } from 'discord.js';

export default class Kick extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Deletes the inputted role.',
			aliases: new Set(['dr']),
			flags: new Set(['force', 'f']),
			args: [{
				type: 'role',
				prompt: { initialMsg: 'mention the role / enter the role\'s name or ID that you would like to list members from.' }
			}],
			userPerms: { flags: 'MANAGE_ROLES' }
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
			return msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${response}` });
		}
		await msg.react('464034357955395585');
		const members = (await msg.guild.members.fetch()).filter(m => m.roles.has(role.id));
		const deleteRole = async () => {
			await role.delete(`Deleted by ${msg.author.tag}`);
			msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have deleted the role \`${role.name}\`. 🗑` });
		};
		if (flag) return deleteRole();
		new Prompt({
			msg,
			initialMsg: `**${msg.author.tag}** are you sure you want to delete the role \`${role.name}\` which will also remove the role from \`${members.size} member(s)\`?  Enter __y__es or __n__o`,
			invalidResponseMsg: 'Enter __y__es or __n__o',
			files: [{ attachment: Buffer.from(members.map(member => `${member.user.tag} | ${member.id}`).join('\r\n'), 'utf8'), name: `${members.size} members.txt` }],
			target: (_msg: HavocMessage) => _msg.arg.match(/^(yes|y|n|no)$/i)
		}).on('promptResponse', async ([responses]) => {
			if ((await responses).target[0][0] === 'y') {
				deleteRole();
			} else {
				msg.response = await msg.sendEmbed({ setDescription: `**${msg.author.tag}** the \`deleterole\` command has been cancelled.` });
			}
		});
	}
}
