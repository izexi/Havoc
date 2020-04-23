import Command from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Creates a giveaway with options.',
      aliases: ['g'],
      subParent: {
        subCommands: ['start', 'end', 'reroll', 'config'],
        prompt:
          'would you like to `start`, `end`, `reroll` or `config` a giveaway? (enter the according option)'
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
