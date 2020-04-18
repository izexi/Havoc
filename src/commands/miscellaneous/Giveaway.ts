import Command, { Status } from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Creates a giveaway with options.',
      aliases: ['g'],
      args: {
        required: true,
        type: message => {
          const possibleSubCmd = message.arg?.toLowerCase();
          if (!possibleSubCmd) return;
          if (['start', 'end', 'reroll', 'config'].includes(possibleSubCmd)) {
            message.command = message.client.commandHandler.find(
              `giveaway-${possibleSubCmd}`
            )!;
            message.runCommand();
            return Status.SUBCOMMAND;
          }
        },
        promptOpts: {
          initial:
            'would you like to `start`, `end`, `reroll` or `config` a giveaway? (enter the according option)',
          invalid: 'You will need to enter either `start`, `end` or `reroll`'
        }
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
