import Havoc from '../client/Havoc';
import { MessageEmbed, WebhookClient } from 'discord.js';

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
    avatarURL:
      'https://icons-for-free.com/iconfiles/png/512/check+checkbox+checkmark+confirm+success+yes+icon-1320196711226060446.png'
  });
}
