import Command from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Configure the autorole (role to add to members as they join) for the server.',
      subParent: {
        subCommands: ['enable', 'config', 'disable'],
        prompt:
          'would you like to `enable`, `config` or `disable` the autorole for this server? (enter the according option)'
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
