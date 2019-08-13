import HavocClient from '../client/Havoc';
import { Role, MessageEmbed } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, role: Role) {
	const executor = await Log.getExecutor(role, 'CHANNEL_DELETE');
	Log.send(role.guild as HavocGuild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📂Role name:**  ${role.name}
				**📅Timestamp of creation :**  ${role.createdAt.toLocaleString()} (UTC)
			`)
			.setColor('RED')
			.setAuthor('Role was deleted', (role.guild as HavocGuild).iconURL())
			.setFooter(`Role ID: ${role.id}`)
			.setTimestamp());
}
