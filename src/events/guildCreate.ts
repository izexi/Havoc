import HavocClient from '../client/Havoc';
import { MessageEmbed } from 'discord.js';
import HavocGuild from '../extensions/Guild';
import HavocTextChannel from '../extensions/TextChannel';
import Logger from '../util/Logger';

export default async function(this: HavocClient, guild: HavocGuild) {
	if (!guild.available) return;
	if (guild.memberCount >= 25) {
		await this.supportServer.members.fetch(guild.ownerID)
			.then(async member => member.roles.add('473618117113806868'))
			.catch(() => null);
	}
	(this.channels.get('417364417374715924') as HavocTextChannel).send(
		new MessageEmbed()
			.setDescription(`
				**Guild Name :**  ${guild.name}
				**Guild owner :**  ${(await this.users.fetch(guild.ownerID)).tag}
				**Guild members size :**  ${guild.memberCount}
				**Total guild count :**  ${this.guilds.size}
				**Total user count :**  ${this.guilds.reduce((a, b) => a + b.memberCount, 0)}
			`)
			.setColor('GREEN')
			.setAuthor('Joined a new guild', guild.iconURL())
			.setFooter(`Guild ID: ${guild.id}`)
			.setTimestamp()
	);
	Logger.joined(guild);
}
