import HavocClient from '../client/Havoc';
import { Role, MessageEmbed } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, role: Role) {
	const executor = await Log.getExecutor(role, 'ROLE_CREATE');
	Log.send(role.guild as HavocGuild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🖋Created By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${role.createdAt.toLocaleString()} (UTC)
			`)
			.setColor('GREEN')
			.setAuthor('Role was created', (role.guild as HavocGuild).iconURL())
			.setFooter(`Role ID: ${role.id}`)
			.setTimestamp());
}
