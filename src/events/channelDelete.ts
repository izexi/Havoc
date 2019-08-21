import HavocClient from '../client/Havoc';
import { TextChannel, VoiceChannel, CategoryChannel, NewsChannel, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, channel: TextChannel | VoiceChannel | CategoryChannel | NewsChannel) {
	const guild = channel.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(1)) return;
	const executor = await Log.getExecutor(channel, 'CHANNEL_DELETE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🗑Deleted By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${channel.createdAt.toLocaleString()} (UTC)
				**📂Channel name:**  ${channel.name}
				**📣Channel type :**  ${channel.type}
			`)
			.setColor('RED')
			.setAuthor(`Channel was deleted${channel.parent ? ` in category ${channel.parent.name}` : ''}`, guild.iconURL())
			.setFooter(`Channel ID: ${channel.id}`)
			.setTimestamp());
}
