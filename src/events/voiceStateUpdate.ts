import HavocClient from '../client/Havoc';
import { VoiceState, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, outdated: VoiceState, updated: VoiceState) {
	const guild = updated.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(19)) return;
	if (!outdated.channel && !updated.channel) return;
	if ((outdated.channel && updated.channel) && outdated.channel.id === updated.channel.id) return;
	Log.send(guild,
		new MessageEmbed()
			/* eslint-disable @typescript-eslint/indent */
			.setDescription(`
				${outdated.channel && updated.channel
					? `**⤴From :**  ${outdated.channel.name}\n**⤵To :**  ${updated.channel.name}`
					: `**🔈Channel Name :**  ${(outdated.channel || updated.channel)!.name}`}
				**🔎Member :**  ${updated.member}
			`)
			.setColor(
				outdated.channel && updated.channel
					? 'ORANGE'
					: (outdated.channel ? 'RED' : 'GREEN')
			)
			.setAuthor(`${(await this.users.fetch(updated.id)).tag} ${outdated.channel && updated.channel ? 'switched voice channels' : `${(outdated.channel ? 'left' : 'joined')} a voice channel`}`)
			.setFooter(`Voice channel ID: ${(outdated.channel || updated.channel)!.id}`)
			.setTimestamp());
}
