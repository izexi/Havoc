import Havoc from '../client/Havoc';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import { MessageEmbed } from 'discord.js';

export default function(this: Havoc) {
  this.logger.info(
    `${this.user!.tag} is ready in ${this.guilds.cache.size} guilds`,
    { origin: 'Havoc#on:ready' }
  );

  (this.channels.cache.get('614043112662368277') as HavocTextChannel).send(
    new MessageEmbed()
      .setTitle(
        // @ts-ignore
        `Client is ready (${this.ws.sessionStartLimit?.remaining} identifies remaining)`
      )
      .setColor('GREEN')
      .setTimestamp()
  );
}
