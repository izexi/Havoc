import Havoc from '../client/Havoc';
import { CloseEvent, WebhookClient, MessageEmbed } from 'discord.js';
import { STATUS_ICONS } from '../util/CONSTANTS';

export default function(this: Havoc, event: CloseEvent, id: number) {
  const info = `Shard ${id} disconnected (${event.reason})`;

  this.logger.error(info, { origin: 'Havoc#on:shardDisconnected' });

  new WebhookClient(
    process.env.STATUS_WEBHOOK_ID!,
    process.env.STATUS_WEBHOOK_TOKEN!
  ).send({
    embeds: [
      new MessageEmbed()
        .setTitle(info)
        .setColor('RED')
        .setTimestamp()
    ],
    avatarURL: STATUS_ICONS.DISCONNECTED
  });
}
