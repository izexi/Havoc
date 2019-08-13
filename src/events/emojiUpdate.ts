import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildEmoji } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, outdated: GuildEmoji, updated: GuildEmoji) {
	if (outdated.name === updated.name) return;
	const executor = await Log.getExecutor(updated, 'EMOJI_UPDATE');
	Log.send(updated.guild as HavocGuild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📝Old Emoji name :**  ${outdated.name}\n✏**New Emoji name :**  ${updated.name}
				**📅Timestamp of creation :**  ${updated.createdAt.toLocaleString()} (UTC)
				**🔎Emoji URL:**  ${updated.url}
			`)
			.setColor('ORANGE')
			.setAuthor('Emoji was updated', (updated.guild as HavocGuild).iconURL())
			.setFooter(`Emoji ID: ${updated.id}`)
			.setTimestamp());
}
