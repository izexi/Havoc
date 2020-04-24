import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Creates a giveaway with options.',
      aliases: ['g'],
      args: {
        required: true,
        type: ['start', 'end', 'reroll', 'config'],
        promptOpts: {
          initial:
            'would you like to `start`, `end`, `reroll` or `config` the welcomer for this server? (enter the according option)',
          invalid:
            'You will need to enter either `start`, `end`, `reroll` or `config`'
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
