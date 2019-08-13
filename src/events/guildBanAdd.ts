import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';
import HavocUser from '../extensions/User';

export default async function(this: HavocClient, guild: HavocGuild, user: HavocUser) {
	const entry = await Log.getEntry(guild, 'MEMBER_BAN_ADD');
	const executor = await Log.getExecutor({ guild, id: user.id }, 'MEMBER_BAN_ADD', entry);
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🔨Banned By :**  ${executor}` : ''}
				${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
			`)
			.setColor('RED')
			.setAuthor(`${user.tag} was banned`, (guild as HavocGuild).iconURL())
			.setFooter(`User ID: ${user.id}`)
			.setTimestamp());
}
