import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildEmoji } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, emoji: GuildEmoji) {
	const guild = emoji.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(4)) return;
	const executor = await Log.getExecutor(emoji, 'EMOJI_CREATE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**✏Created By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${emoji.createdAt.toLocaleString()} (UTC)
				**📂Emoji name:**  ${emoji.name}
				**🔎Emoji URL:**  ${emoji.url}
			`)
			.setColor('GREEN')
			.setAuthor('Emoji was created', guild.iconURL())
			.setFooter(`Emoji ID: ${emoji.id}`)
			.setTimestamp());
}
