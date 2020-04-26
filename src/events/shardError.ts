import Havoc from '../client/Havoc';
import { WebhookClient, MessageEmbed } from 'discord.js';
import { STATUS_ICONS } from '../util/CONSTANTS';
import Util from '../util';

export default function(this: Havoc, error: Error, shardID: number) {
  const message = `Shard ${shardID} encountered an error`;

  this.logger.error(`${message} |=> \nerror.message`, {
    origin: 'Havoc#on:shardError'
  });

  new WebhookClient(
    process.env.STATUS_WEBHOOK_ID!,
    process.env.STATUS_WEBHOOK_TOKEN!
  ).send({
    embeds: [
      new MessageEmbed()
        .setTitle(message)
        .setDescription(Util.codeblock(error.message))
        .setColor('RED')
        .setTimestamp()
    ],
    avatarURL: STATUS_ICONS.ERROR
  });
}
