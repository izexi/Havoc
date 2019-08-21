import HavocClient from '../client/Havoc';
import { Role, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, role: Role) {
	const guild = role.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(17)) return;
	const executor = await Log.getExecutor(role, 'CHANNEL_DELETE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📂Role name:**  ${role.name}
				**📅Timestamp of creation :**  ${role.createdAt.toLocaleString()} (UTC)
			`)
			.setColor('RED')
			.setAuthor('Role was deleted', guild.iconURL())
			.setFooter(`Role ID: ${role.id}`)
			.setTimestamp());
}
