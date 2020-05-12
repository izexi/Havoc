import HavocGuild from '../structures/extensions/HavocGuild';
import Havoc from '../client/Havoc';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { NOOP, IDS } from '../util/CONSTANTS';

export default async function(this: Havoc, guild: HavocGuild) {
  if (!guild.available) return;
  if (this.blacklisted.guilds.has(guild.id)) guild.leave();

  this.prometheus.guildGauge.inc();
  this.prometheus.userGauge.inc(guild.memberCount);

  if (guild.memberCount >= 25) {
    await this.guilds.cache
      .get(IDS.SUPPORT_SERVER)!
      .members.fetch(guild.ownerID)
      .then(member => member.roles.add(IDS.SERVER_OWNER))
      .catch(NOOP);
  }

  (this.channels.cache.get(IDS.GUILD_JOIN_LEAVE) as HavocTextChannel).send(
    new MessageEmbed()
      .setDescription(
        stripIndents`**Guild name :**  ${guild.name}
				**Guild owner :**  ${(await this.users.fetch(guild.ownerID)).tag}
				**Guild members size :**  ${guild.memberCount}
				**Total guild count :**  ${this.guilds.cache.size}
				**Total user count :**  ~${this.totalMemberCount}`
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
