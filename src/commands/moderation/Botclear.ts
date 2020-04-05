import Command, { Status } from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import GuildEntity from '../../structures/entities/GuildEntity';
import Util from '../../util/Util';

export const defaultPrefixes = (message: HavocMessage) => [
  message.prefix!,
  '!',
  '.',
  '?'
];

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Deletes recent bot messages & messages that contain bot commands (messages that start with popular bot prefixes along with the configured prefixes) to keep the chat clean.',
      aliases: ['bc'],
      args: {
        type: message => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (possibleSubCmd === 'config') {
            message.command = message.client.commandHandler.commands.get(
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
    const guildEntity = await this.db.find(GuildEntity, message.guild!.id);
    const bcPrefixes = guildEntity
      ? guildEntity.bcPrefixes || defaultPrefixes(message)
      : defaultPrefixes(message);
    const messages = await message.channel.messages
      .fetch({ limit: 100 })
      .catch(() => null);

    if (!messages)
      return message.respond(
        'I encountered an error when attempting to fetch recent messages to botclear, maybe try again later?'
      );

    const cleared = await message.channel
      .bulkDelete(
        messages.filter(
          msg =>
            msg.author!.bot ||
            (bcPrefixes || [message.prefix!, '!', '.', '?']).some(prefix =>
              msg.content.startsWith(prefix)
            )
        ),
        true
      )
      .catch(() => null);

    if (!cleared)
      return message.respond(
        'I encountered an error when attempting to botclear the messages, maybe try again later?'
      );

    message
      .respond(
        `bot cleared \`${cleared.size} ${Util.plural(
          'message',
          cleared.size
        )}\` ${emojis[Util.randomInt(0, emojis.length - 1)]}`
      )
      .then(async message => message.delete({ timeout: 1300 }))
      .catch(() => null);
  }
}
