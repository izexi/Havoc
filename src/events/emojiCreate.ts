import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildEmoji } from 'discord.js';
import Log from '../structures/bases/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, emoji: GuildEmoji) {
	const executor = await Log.getExecutor(emoji, 'EMOJI_CREATE');
	Log.send(emoji.guild as HavocGuild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**✏Created By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${emoji.createdAt.toLocaleString()} (UTC)
				**📂Emoji name:**  ${emoji.name}
				**🔎Emoji URL:**  ${emoji.url}
			`)
			.setColor('GREEN')
			.setAuthor('Emoji was created', (emoji.guild as HavocGuild).iconURL())
			.setFooter(`Emoji ID: ${emoji.id}`)
			.setTimestamp());
}
