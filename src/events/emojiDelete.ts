import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildEmoji } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, emoji: GuildEmoji) {
	const executor = await Log.getExecutor(emoji, 'EMOJI_DELETE');
	Log.send(emoji.guild as HavocGuild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${emoji.createdAt.toLocaleString()} (UTC)
				**📂Emoji name:**  ${emoji.name}
				**🔎Emoji URL:**  ${emoji.url}
			`)
			.setColor('RED')
			.setAuthor('Emoji was deleted', (emoji.guild as HavocGuild).iconURL())
			.setFooter(`Emoji ID: ${emoji.id}`)
			.setTimestamp());
}
