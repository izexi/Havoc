import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { Role } from 'discord.js';

export default class AutoroleEnable extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Enable autorole for the inputted role.',
			args: [{
				type: 'role',
				prompt: { initialMsg: 'enter the the role you would like to set the autorole.' }
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { role } }: { msg: HavocMessage; target: { role: Role } }) {
		const { autorole } = await msg.guild.config;
		await msg.guild.addConfig({ autorole: role.id });
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** ${autorole && msg.guild.roles.has(autorole) ? `I have updated the autorole from ${msg.guild.roles.get(autorole)} to ${role}` : `I have enabled autorole for ${role} for this server.`}` });
	}
}
