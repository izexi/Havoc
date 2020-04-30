import HavocGuild from '../structures/extensions/HavocGuild';
import Havoc from '../client/Havoc';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import { MessageEmbed } from 'discord.js';
import GuildEntity from '../structures/entities/GuildEntity';
import fetch from 'node-fetch';

export default async function(this: Havoc, guild: HavocGuild) {
  if (!guild.available) return;

  this.prometheus.guildGauge.dec(1);

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
      .catch(() => null);
  }

  const wasDeleted = await fetch(
    `https://canary.discordapp.com/api/guilds/${guild.id}/widget.json`
  )
    .then(res => res.json())
    .then(({ code }) => code === 10004)
    .catch(() => null);
  if (wasDeleted) return;

  (this.channels.cache.get('417364417374715924') as HavocTextChannel).send(
    new MessageEmbed()
      .setDescription(
        `**Guild Name :**  ${guild.name}
				**Total guild count :**  ${this.guilds.cache.size}
				**Total user count :**  ${this.guilds.cache.reduce(
          (total, guild) => total + guild.memberCount,
          0
        )}`
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
