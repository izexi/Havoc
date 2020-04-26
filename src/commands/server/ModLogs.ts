import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { PROMPT_INVALD, PROMPT_INITIAL } from '../../util/Constants';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the mod logs for the server.',
      requiredPerms: 'MANAGE_GUILD',
      args: {
        required: true,
        type: ['enable', 'config', 'disable'],
        promptOpts: {
          initial: PROMPT_INITIAL[Target.OPTION](
            ['enable', 'config', 'disable'],
            'mod logs for this server'
          ),
          invalid: PROMPT_INVALD('either `enable`, `config` or `disable`')
        }
      }
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
