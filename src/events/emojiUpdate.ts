import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildEmoji } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, outdated: GuildEmoji, updated: GuildEmoji) {
	if (outdated.name === updated.name) return;
	const guild = updated.guild as HavocGuild;
	if (guild.disabledLogs.has(6)) return;
	const executor = await Log.getExecutor(updated, 'EMOJI_UPDATE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📝Old Emoji name :**  ${outdated.name}\n✏**New Emoji name :**  ${updated.name}
				**📅Timestamp of creation :**  ${updated.createdAt.toLocaleString()} (UTC)
				**🔎Emoji URL:**  ${updated.url}
			`)
			.setColor('ORANGE')
			.setAuthor('Emoji was updated', guild.iconURL())
			.setFooter(`Emoji ID: ${updated.id}`)
			.setTimestamp());
}
