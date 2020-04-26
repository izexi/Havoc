import Havoc from '../client/Havoc';
import { WebhookClient, MessageEmbed } from 'discord.js';
import { STATUS_ICONS } from '../util/CONSTANTS';

export default function(this: Havoc, shardID: number) {
  const message = `Shard ${shardID} is ready`;

  this.logger.info(message, { origin: 'Havoc#on:shardReady' });

  new WebhookClient(
    process.env.STATUS_WEBHOOK_ID!,
    process.env.STATUS_WEBHOOK_TOKEN!
  ).send({
    embeds: [
      new MessageEmbed()
        .setTitle(message)
        .setColor('GREEN')
        .setTimestamp()
    ],
    avatarURL: STATUS_ICONS.READY
  });
}
