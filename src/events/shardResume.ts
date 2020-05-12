import Havoc from '../client/Havoc';
import { WebhookClient, MessageEmbed } from 'discord.js';
import { STATUS_ICONS } from '../util/CONSTANTS';

export default function (this: Havoc, shardID: number, replayedEvents: number) {
  const message = `${shardID} is resuming (replaying ${replayedEvents} events)`;

  this.logger.info(message, { origin: 'Havoc#on:shardResumed' });

  new WebhookClient(
    process.env.STATUS_WEBHOOK_ID!,
    process.env.STATUS_WEBHOOK_TOKEN!
  ).send({
    embeds: [
      new MessageEmbed().setTitle(message).setColor('ORANGE').setTimestamp(),
    ],
    avatarURL: STATUS_ICONS.RESUMED,
  });
}
