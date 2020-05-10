import Command, { Status } from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import { TextChannel } from 'discord.js';
import { NOOP } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Deletes recent bot messages & messages that contain bot commands (messages that start with popular bot prefixes along with the configured prefixes) to keep the chat clean.',
      aliases: ['bc'],
      args: {
        name: 'config',
        example: ['config'],
        type: message => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (possibleSubCmd === 'config') {
            message.args.shift();
            message.command = message.client.commandHandler.find(
              'botclear-config'
            )!;
            message.runCommand();
            return Status.SUBCOMMAND;
          }
          return null;
        }
      },
      requiredPerms: 'MANAGE_MESSAGES'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      fn
    }: {
      message: HavocMessage;
      fn: number | null;
    }
  ) {
    if (fn === Status.SUBCOMMAND) return;

    const emojis = [
      '<:botclear1:486606839015014400>',
      '<:botclear2:486606870618963968>',
      '<:botclear3:486606906337525765>'
    ];
    const messages = await message.channel.messages
      .fetch({ limit: 100 })
      .catch(NOOP);

    if (!messages)
      return message.respond(
        'I encountered an error when attempting to fetch recent messages to botclear, maybe try again later?'
      );

    const cleared = await (message.channel as TextChannel)
      .bulkDelete(
        messages.filter(
          msg =>
            msg.author!.bot ||
            [message.guild!.prefix, ...message.guild!.bcPrefixes].some(prefix =>
              msg.content.startsWith(prefix)
            )
        ),
        true
      )
      .catch(NOOP);

    if (!cleared)
      return message.respond(
        'I encountered an error when attempting to botclear the messages, maybe try again later?'
      );

    message
      .respond(
        `bot cleared \`${cleared.size} ${Util.plural(
          'message',
          cleared.size
        )}\` ${Util.randomArrEl(emojis)}`
      )
      .then(message => message.delete({ timeout: 1300 }))
      .catch(NOOP);
  }
}
