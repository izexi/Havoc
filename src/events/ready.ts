import Havoc from '../client/Havoc';
import { MessageEmbed, WebhookClient } from 'discord.js';
import { STATUS_ICONS } from '../util/CONSTANTS';

export default function(this: Havoc) {
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
}
