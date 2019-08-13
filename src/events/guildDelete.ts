import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import HavocGuild from '../extensions/Guild';
import HavocTextChannel from '../extensions/TextChannel';
import Logger from '../util/Logger';

export default async function(this: HavocClient, guild: HavocGuild) {
	if (!guild.available) return;
	(this.channels.get('417364417374715924') as HavocTextChannel).send(
		new MessageEmbed()
			.setDescription(`
				**Guild Name :**  ${guild.name}
				**Total guild count :**  ${this.guilds.size}
				**Total user count :**  ${this.guilds.reduce((a, b) => a + b.memberCount, 0)}
			`)
			.setColor('RED')
			.setAuthor('Left a guild', guild.iconURL())
			.setFooter(`Guild ID: ${guild.id}`)
			.setTimestamp()
	);
	Logger.left(guild);
}
