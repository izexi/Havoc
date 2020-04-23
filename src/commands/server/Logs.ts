import Command from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the logs for the server.',
      subParent: {
        subCommands: ['enable', 'config', 'disable'],
        prompt:
          'would you like to `enable`, `config` or `disable` the logs for this server? (enter the according option)'
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
