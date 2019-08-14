import HavocClient from '../client/Havoc';
import { TextChannel, VoiceChannel, CategoryChannel, NewsChannel, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, channel: TextChannel | VoiceChannel | CategoryChannel | NewsChannel) {
	const executor = await Log.getExecutor(channel, 'CHANNEL_CREATE');
	Log.send(channel.guild as HavocGuild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**✏Created By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${channel.createdAt.toLocaleString()} (UTC)
				**📂Channel name:**  ${channel.name}
				**📣Channel type :**  ${channel.type}
			`)
			.setColor('GREEN')
			.setAuthor(`Channel was created${channel.parent ? ` in category ${channel.parent.name}` : ''}`, (channel.guild as HavocGuild).iconURL())
			.setFooter(`Channel ID: ${channel.id}`)
			.setTimestamp());
}
