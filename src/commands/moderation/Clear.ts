import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Deletes a chosen amount of messages from a channel / from a user in a channel.',
      aliases: ['c', 'prune', 'purge'],
      flags: ['nopin'],
      args: [
        {
          type: Target.NUMBER,
          required: true,
          promptOpts: {
            initial:
              'enter the amount of messages that you would like to clear.',
            invalid:
              'You need to enter the number of messages you would like to clear, e.g: entering `5` would clear 5 messages.'
          }
        },
        {
          type: Target.USER
        }
      ],
      requiredPerms: 'MANAGE_MESSAGES'
    });
  }

  async run({
    message,
    number,
    user,
    flags
  }: {
    message: HavocMessage;
    number: number;
    user: HavocUser | null;
    flags: { nopin?: undefined };
  }) {
    const emojis = [
      '<:botclear1:486606839015014400>',
      '<:botclear2:486606870618963968>',
      '<:botclear3:486606906337525765>'
    ];
    await message.delete();

    let messages = await message.channel.messages
      .fetch({ limit: 100 })
      .catch(() => null);
    if (!messages)
      return message.respond(
        'I encountered an error when attempting to fetch recent messages to clear, maybe try again later?'
      );

    if (user) messages = messages.filter(msg => msg.author.id === user.id);
    if ('nopin' in flags)
      messages = messages.filter(message => !message.pinned);
    const cleared = await message.channel
      .bulkDelete(
        isNaN(number) ? messages : messages.first(Math.min(number, 100)),
        true
      )
      .catch(() => null);

    if (!cleared)
      return message.respond(
        'I encountered an error when attempting to clear the messages, maybe try again later?'
      );

    message
      .respond(
        `cleared \`${cleared.size} ${Util.plural('message', cleared.size)}\` ${
          emojis[Util.randomInt(0, emojis.length - 1)]
        }`
      )
      .then(async message => message.delete({ timeout: 1300 }))
      .catch(() => null);
  }
}
