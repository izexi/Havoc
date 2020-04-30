import HavocGuild from '../structures/extensions/HavocGuild';
import Havoc from '../client/Havoc';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import { MessageEmbed } from 'discord.js';
import GuildEntity from '../structures/entities/GuildEntity';
import fetch from 'node-fetch';
import { stripIndents } from 'common-tags';
import { NOOP } from '../util/CONSTANTS';

export default async function(this: Havoc, guild: HavocGuild) {
  if (!guild.available) return;

  this.prometheus.guildGauge.dec();
  this.prometheus.userGauge.dec(guild.memberCount ?? this.totalMemberCount);

  const guildEntity = await this.db.find(GuildEntity, guild.id);
  if (guildEntity) {
    guildEntity.deletedAt = new Date();
    await this.db.flush();
  }

  if (
    !this.guilds.cache.some(
      g => g.ownerID === guild.ownerID && g.memberCount >= 25
    )
  ) {
    await this.guilds.cache
      .get('406873117215031297')!
      .members.fetch(guild.ownerID)
      .then(member => member.roles.remove('473618117113806868'))
      .catch(NOOP);
  }

  const wasDeleted = await fetch(
    `https://canary.discordapp.com/api/guilds/${guild.id}/widget.json`
  )
    .then(res => res.json())
    .then(({ code }) => code === 10004)
    .catch(NOOP);
  if (wasDeleted) return;

  (this.channels.cache.get('417364417374715924') as HavocTextChannel).send(
    new MessageEmbed()
      .setDescription(
        stripIndents`**Guild Name :**  ${guild.name}
				**Total guild count :**  ${this.guilds.cache.size}
				**Total user count :**  ${this.totalMemberCount}`
      )
      .setColor('RED')
      .setAuthor('Left a guild', guild.iconURL())
      .setFooter(`Guild ID: ${guild.id}`)
      .setTimestamp()
  );

  this.logger.info(`Left ${guild.name} (${guild.id})`, {
    origin: 'Havoc#on:guildDelete'
  });
}
