import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Havoc from '../../client/Havoc';
import GuildEntity from '../../structures/entities/GuildEntity';
import { Target } from '../../util/targetter';
import { PROMPT_INVALD, PROMPT_INITIAL } from '../../util/CONSTANTS';
import util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Configure the `botclear` command (view, add or remove bot prefixes).',
      sub: true,
      args: {
        required: true,
        name: 'sub command',
        example: ['view', 'add ~', 'remove ~'],
        type: ['view', 'add', 'remove'],
        promptOpts: {
          initial: PROMPT_INITIAL[Target.OPTION](
            ['view', 'add', 'remove'],
            'prefixes that will be botcleared'
          ),
          invalid: PROMPT_INVALD('either `view` or `add` or `remove`.')
        }
      },
      requiredPerms: 'MANAGE_MESSAGES'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      option
    }: {
      message: HavocMessage;
      option: 'view' | 'add' | 'remove';
    }
  ) {
    const bcPrefixes = util.spliceDupes([
      message.guild!.prefix,
      ...message.guild!.bcPrefixes
    ]);

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

    message.guild!.bcPrefixes = bcPrefixes;
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
