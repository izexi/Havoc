import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildMember } from 'discord.js';
import HavocGuild from '../extensions/Guild';
import Log from '../structures/bases/Log';
import Util from '../util/Util';
import HavocTextChannel from '../extensions/TextChannel';

export default async function(this: HavocClient, member: GuildMember) {
	const guild = member.guild as HavocGuild;
	const { endTime } = await this.db.fieldQuery('mute', false, ['guild', guild.id], ['member', member.id])
		.catch(() => ({ endTime: null })) || { endTime: null };
	if (endTime && endTime > 0) {
		// @ts-ignore
		const muteRole = await this.commands.handler.get('mute').getMuteRole(guild);
		member.roles.add(muteRole, 'Mute continutation');
	}
	const { welcomer, autorole } = await guild.config;
	if (autorole) {
		if (!guild.roles.has(autorole)) {
			return guild.removeConfig('autorole');
		}
		member.roles.add(autorole, 'Auto role');
	}
	if (welcomer) {
		if (!this.channels.has(welcomer)) {
			return guild.removeConfig('welcomer');
		}
		const emojis = ['✨', '🎉', '⚡', '🔥', '☄', '💨', '🌙', '💥'];
		const embed = new MessageEmbed()
			.setDescription(`
				**${member.user.tag}**
				Welcome to the **${member.guild.name}** server! ⠀ 
				You're the ${Util.ordinal(member.guild.memberCount)} member here ${emojis[Util.randomInt(0, emojis.length - 1)]}
				⠀⠀⠀⠀⠀⠀⠀
			`)
			.setThumbnail(member.user.pfp)
			.setColor('RANDOM')
			.setFooter('New member joined!', (member.guild as HavocGuild).iconURL())
			.setTimestamp();
		(this.channels.get(welcomer) as HavocTextChannel).send(member.toString(), embed);
	}
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				**📆Account created at :**  ${member.user.createdAt.toLocaleString()} (UTC)
				**ℹGuild member count :**  ${member.guild.memberCount}
			`)
			.setColor('GREEN')
			.setAuthor(`${member.user.tag} joined`, member.user.pfp)
			.setFooter(`User ID: ${member.id}`)
			.setTimestamp());
}
