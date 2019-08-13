import HavocClient from '../client/Havoc';
import { MessageEmbed, GuildMember } from 'discord.js';
import HavocGuild from '../extensions/Guild';
import Log from '../structures/bases/Log';
import Util from '../util/Util';
import HavocTextChannel from '../extensions/TextChannel';

export default async function(this: HavocClient, member: GuildMember) {
	const guild = member.guild as HavocGuild;
	const entry = await Log.getEntry(guild, 'MEMBER_KICK');
	const executor = await Log.getExecutor(member, 'MEMBER_KICK', entry);
	const { welcomer } = await guild.config;
	if (welcomer) {
		if (!this.channels.has(welcomer)) {
			return guild.removeConfig('welcomer');
		}
		const embed = new MessageEmbed()
			.setDescription(`
				**${member.user.tag}** has left the **${member.guild.name}** server 👋
				${member.lastMessage && member.lastMessage.content ? `\nTheir last words were:\n ❝${member.lastMessage.content}❞ - ${Util.smallCaps(member.user.username)}` : ''}⠀⠀⠀⠀
			`)
			.setThumbnail(member.user.pfp)
			.setColor('RANDOM')
			.setFooter('A member left!', (member.guild as HavocGuild).iconURL())
			.setTimestamp();
		(this.channels.get(welcomer) as HavocTextChannel).send(member.toString(), embed);
	}
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**👢Kicked By :**  ${executor}` : ''}
				${entry && entry.reason ? `**💬Reason :**  ${entry.reason}` : ''}
				**📆Account created at :**  ${member.user.createdAt.toLocaleString()} (UTC)
				${member.joinedAt ? `**🗓Joined guild at :**  ${member.joinedAt.toLocaleString()} (UTC)\n` : ''}
				**ℹGuild member count :**  ${member.guild.memberCount}
			`)
			.setColor('RED')
			.setAuthor(`${member.user.tag} ${executor ? 'was kicked' : 'left'}`, member.user.pfp)
			.setFooter(`User ID: ${member.id}`)
			.setTimestamp());
}
