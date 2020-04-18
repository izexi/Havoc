import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import GuildEntity from '../../structures/entities/GuildEntity';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Configure the `botclear` command (view, add or remove bot prefixes).',
      sub: true,
      args: {
        required: true,
        type: message => {
          const possibleOption = message.arg?.toLowerCase();
          if (!possibleOption) return;
          if (['view', 'add', 'remove'].includes(possibleOption))
            return message.shiftArg(possibleOption);
        },
        promptOpts: {
          initial:
            'what would you like to configure from prefixes that will be botcleared?\nEnter `view` / `add` / `remove`.',
          invalid: 'You will need to enter either `view` or `add` or `remove`.'
        }
      },
      requiredPerms: 'MANAGE_MESSAGES'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      fn: option
    }: {
      message: HavocMessage;
      fn: 'view' | 'add' | 'remove';
    }
  ) {
    const bcPrefixes = [message.guild!.prefix, ...message.guild!.bcPrefixes]!;

    if (option === 'view')
      return message.respond(
        `current messages that are prefixed with ${bcPrefixes!
          .map(prefix => `\`${prefix}\``)
          .join(', ')} will be cleared when the botclear command is used.`
      );

    const prefix =
      message.arg ||
      (
        await message.createPrompt({
          initialMsg: `**${message.author.tag}** enter the prefix that you would ${option} to the botclears.`,
          target: Target.TEXT
        })
      ).text;
    if (!prefix) return;

    if (option === 'add') {
      if (bcPrefixes!.includes(prefix)) {
        return message.respond(
          `\`${prefix}\` is already prefix that is being botcleared, you can view all the prefixes by entering \`${message.prefix}bc config view\`.`
        );
      }
      bcPrefixes!.push(prefix);
    } else {
      if (!bcPrefixes!.includes(prefix)) {
        return message.respond(
          `\`${prefix}\` isn't a prefix that is being botcleared, you can view all the prefixes by entering \`${message.prefix}bc config view\`.`
        );
      }
      bcPrefixes!.splice(bcPrefixes!.indexOf(prefix), 1);
    }

    await this.db.upsert(GuildEntity, message.guild!.id, { bcPrefixes });

    message.respond(
      `I have ${option}${
        option === 'add' ? 'e' : ''
      }d \`${prefix}\` to the list of prefixes that will be botcleared, you can view all the prefixes by entering \`${
        message.prefix
      }bc config view\`.`
    );
  }
}
