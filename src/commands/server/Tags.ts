import Command, { Status } from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the tags for the server.',
      args: {
        required: true,
        type: message => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (
            ['add', 'delete', 'edit', 'info', 'list'].includes(possibleSubCmd)
          ) {
            message.command = message.client.commandHandler.find(
              `tags-${possibleSubCmd}`
            )!;
            message.runCommand();
            return Status.SUBCOMMAND;
          }
        },
        promptOpts: {
          initial:
            'would you like to `add`, `delete`, `edit`, `info` or `list` tags to/from server? (enter the according option)',
          invalid:
            'You will need to enter either `add`, `delete`, `edit`, `info` or `list`'
        }
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
