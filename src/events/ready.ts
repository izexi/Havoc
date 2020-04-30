import Havoc from '../client/Havoc';
import { MessageEmbed, WebhookClient } from 'discord.js';
import { STATUS_ICONS, HAVOC } from '../util/CONSTANTS';
import DevEntity, { Blacklistable } from '../structures/entities/DevEntity';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import ms = require('ms');

export default async function(this: Havoc) {
  this.logger.info(
    `${this.user!.tag} is ready in ${this.guilds.cache.size} guilds`,
    { origin: 'Havoc#on:ready' }
  );

  new WebhookClient(
    process.env.STATUS_WEBHOOK_ID!,
    process.env.STATUS_WEBHOOK_TOKEN!
  ).send({
    embeds: [
      new MessageEmbed()
        .setTitle(
          // @ts-ignore
          `Client is ready (${this.ws.sessionStartLimit?.remaining} identifies remaining)`
        )
        .setColor('GREEN')
        .setTimestamp()
    ],
    avatarURL: STATUS_ICONS.READY
  });

  const devEntity = await this.db.find(DevEntity, HAVOC);
  if (devEntity?.restart) {
    const { restart } = devEntity;
    const message = await (this.channels.cache.get(
      restart.channel
    ) as HavocTextChannel)?.messages.fetch(restart.message);
    if (message?.author.id === this.user?.id) {
      message?.edit(
        message.embeds[0].setDescription(
          `<:tick:416985886509498369> Restarted in ${ms(
            Date.now() - devEntity.updatedAt.getTime()
          )}`
        )
      );
      message?.reactions.removeAll();
    }

    delete devEntity.restart;
    await this.db.flush();
  }

  if (devEntity?.blacklisted) {
    Object.entries(devEntity.blacklisted).forEach(
      ([k, v]) => (this.blacklisted[k as Blacklistable] = new Set(v))
    );
  }
}
