import Havoc from '../client/Havoc';
import { WebhookClient, MessageEmbed } from 'discord.js';
import { STATUS_ICONS } from '../util/CONSTANTS';

export default function(this: Havoc, shardID: number) {
  const message = `${shardID} is reconnecting`;

  this.logger.warn(message, {
    origin: 'Havoc#on:shardReconnecting'
  });

  new WebhookClient(
    process.env.STATUS_WEBHOOK_ID!,
    process.env.STATUS_WEBHOOK_TOKEN!
  ).send({
    embeds: [
      new MessageEmbed()
        .setTitle(message)
        .setColor('YELLOW')
        .setTimestamp()
    ],
    avatarURL: STATUS_ICONS.RECONNECTING
  });
}
