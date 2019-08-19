import HavocClient from '../client/Havoc';
import { Role, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, role: Role) {
	const guild = role.guild as HavocGuild;
	if (guild.disabledLogs.has(16)) return;
	const executor = await Log.getExecutor(role, 'ROLE_CREATE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🖋Created By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${role.createdAt.toLocaleString()} (UTC)
			`)
			.setColor('GREEN')
			.setAuthor('Role was created', guild.iconURL())
			.setFooter(`Role ID: ${role.id}`)
			.setTimestamp());
}
