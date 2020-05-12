import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { PROMPT_INVALD, PROMPT_INITIAL } from '../../util/CONSTANTS';
import { Target } from '../../util/targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the tags for the server.',
      args: {
        required: true,
        type: ['add', 'delete', 'edit', 'info', 'list'],
        promptOpts: {
          initial: PROMPT_INITIAL[Target.OPTION](
            ['add', 'delete', 'edit', 'info', 'list'],
            'tags to / from this server'
          ),
          invalid: PROMPT_INVALD(
            'either `add`, `delete`, `edit`, `info` or `list`'
          ),
        },
      },
      requiredPerms: 'MANAGE_GUILD',
    });
  }

  async run({
    message,
    option: subCommand,
  }: {
    message: HavocMessage;
    option: string;
  }) {
    message.command = message.client.commandHandler.find(
      `${message.command.name}-${subCommand}`
    )!;
    message.runCommand();
  }
}
