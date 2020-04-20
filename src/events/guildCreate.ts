import HavocGuild from '../structures/extensions/HavocGuild';
import Havoc from '../client/Havoc';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import { MessageEmbed } from 'discord.js';

export default async function(this: Havoc, guild: HavocGuild) {
  if (!guild.available) return;

  if (guild.memberCount >= 25) {
    await this.guilds.cache
      .get('406873117215031297')!
      .members.fetch(guild.ownerID)
      .then(member => member.roles.add('473618117113806868'))
      .catch(() => null);
  }

  (this.channels.cache.get('417364417374715924') as HavocTextChannel).send(
    new MessageEmbed()
      .setDescription(
        `**Guild name :**  ${guild.name}
				**Guild owner :**  ${(await this.users.fetch(guild.ownerID)).tag}
				**Guild members size :**  ${guild.memberCount}
				**Total guild count :**  ${this.guilds.cache.size}
				**Total user count :**  ~${this.guilds.cache.reduce(
          (total, guild) => total + guild.memberCount,
          0
        )}`
      )
      .setColor('GREEN')
      .setAuthor('Joined a new guild', guild.iconURL())
      .setFooter(`Guild ID: ${guild.id}`)
      .setTimestamp()
  );

  this.logger.info(
    `Joined ${guild.name} (${guild.id}) with ${guild.memberCount} members`,
    { origin: 'Havoc#on:guildCreate' }
  );
}
