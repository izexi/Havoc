import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildEmoji } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, emoji: GuildEmoji) {
	const guild = emoji.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(5)) return;
	const executor = await Log.getExecutor(emoji, 'EMOJI_DELETE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${emoji.createdAt!.toLocaleString()} (UTC)
				**📂Emoji name:**  ${emoji.name}
				**🔎Emoji URL:**  ${emoji.url}
			`)
			.setColor('RED')
			.setAuthor('Emoji was deleted', guild.iconURL())
			.setFooter(`Emoji ID: ${emoji.id}`)
			.setTimestamp());
}
