import Command from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the mod logs for the server.',
      requiredPerms: 'MANAGE_GUILD',
      subParent: {
        subCommands: ['enable', 'config', 'disable'],
        prompt:
          'would you like to `enable`, `config` or `disable` the mod logs for this server? (enter the according option)'
      }
    });
  }

  async run() {}
}
