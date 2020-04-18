import Command, { Status } from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the mod logs for the server.',
      args: {
        required: true,
        type: message => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (['enable', 'config', 'disable'].includes(possibleSubCmd)) {
            message.command = message.client.commandHandler.find(
              `modlogs-${possibleSubCmd}`
            )!;
            message.runCommand();
            return Status.SUBCOMMAND;
          }
        },
        promptOpts: {
          initial:
            'would you like to `enable`, `config` or `disable` the mod logs for this server? (enter the according option)',
          invalid:
            'You will need to enter either `enable`, `config` or `disable`'
        }
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
