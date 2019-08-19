import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';
import HavocUser from '../extensions/User';

export default async function(this: HavocClient, guild: HavocGuild, user: HavocUser) {
	if (guild.disabledLogs.has(11)) return;
	const entry = await Log.getEntry(guild, 'MEMBER_BAN_REMOVE');
	const executor = await Log.getExecutor({ guild, id: user.id }, 'MEMBER_BAN_REMOVE', entry);
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🔨Unbanned By :**  ${executor}` : ''}
				${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
			`)
			.setColor('GREEN')
			.setAuthor(`${user.tag} was unbanned`, (guild as HavocGuild).iconURL())
			.setFooter(`User ID: ${user.id}`)
			.setTimestamp());
}
