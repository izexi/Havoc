import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the mod logs for the server.',
      requiredPerms: 'MANAGE_GUILD',
      args: {
        required: true,
        type: ['enable', 'config', 'disable'],
        promptOpts: {
          initial:
            'would you like to `enable`, `config` or `disable` the mod logs for this server? (enter the according option)',
          invalid:
            'You will need to enter either `enable`, `config` or `disable`'
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
