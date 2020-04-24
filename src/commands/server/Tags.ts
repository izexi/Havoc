import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the tags for the server.',
      args: {
        required: true,
        type: ['add', 'delete', 'edit', 'info', 'list'],
        promptOpts: {
          initial:
            'would you like to `add`, `delete`, `edit`, `info` or `list` tags to/from this server? (enter the according option)',
          invalid:
            'You will need to enter either `add`, `delete`, `edit`, `info` or `list`'
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
