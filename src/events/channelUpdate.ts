import HavocClient from '../client/Havoc';
import { TextChannel, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, outdated: TextChannel, updated: TextChannel) {
	if (!updated.guild || (outdated.topic === updated.topic && outdated.name === updated.name)) return;
	const guild = updated.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(2)) return;
	const executor = await Log.getExecutor(updated, 'CHANNEL_UPDATE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**🔧Updated By :**  ${executor}` : ''}
				${outdated.topic === updated.topic ? '' : `**📝Old Channel topic :**  ${outdated.topic || '`No topic set.`'}\n✏**New Channel topic :**  ${updated.topic || '`No topic set.`'}`}
				${outdated.name === updated.name ? '' : `**📝Old Channel name :**  ${outdated.name}\n✏**New Channel name :**  ${updated.name}`}
			`)
			.setColor('ORANGE')
			.setAuthor(`Channel was updated${updated.parent ? ` in category ${updated.parent.name}` : ''}`, guild.iconURL())
			.setFooter(`Channel ID: ${updated.id}`)
			.setTimestamp());
}
