import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { PROMPT_INVALD, PROMPT_INITIAL } from '../../util/Constants';
import { Target } from '../../util/Targetter';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Creates a giveaway with options.',
      aliases: ['g'],
      args: {
        required: true,
        type: ['start', 'end', 'reroll', 'config'],
        promptOpts: {
          initial: PROMPT_INITIAL[Target.OPTION](
            ['start', 'end', 'reroll', 'config'],
            'giveaway for this server'
          ),
          invalid: PROMPT_INVALD('either `start`, `end`, `reroll` or `config`')
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
