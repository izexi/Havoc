import HavocMessage from '../structures/extensions/HavocMessage';
import Havoc from '../client/Havoc';
import regex from '../util/regex';

export default function(this: Havoc, message: HavocMessage) {
  if (message.content.toLowerCase() === ',havoc')
    return message.channel.send('hi');

  const prefix = message.guild?.prefix ?? process.env.PREFIX;
  if (this.user && regex.mentionPrefix(this.user.id).test(message.content))
    return message.respond(
      `my prefix here is \`${prefix}\` (you can also mention me).
      You can view a list of all my commands by doing \`${prefix}help\``
    );

  this.commandHandler.handle(message);
}
