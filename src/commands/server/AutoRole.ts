import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { PROMPT_INVALD, PROMPT_INITIAL } from '../../util/Constants';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Configure the autorole (role to add to members as they join) for the server.',
      args: {
        required: true,
        type: ['enable', 'config', 'disable'],
        promptOpts: {
          initial: PROMPT_INITIAL[Target.OPTION](
            ['view', 'add', 'remove'],
            'autorole for this server'
          ),
          invalid: PROMPT_INVALD('either `enable`, `config` or `disable`')
        }
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run({
    message,
    option: subCommand
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
