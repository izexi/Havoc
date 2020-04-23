import Command from '../../structures/bases/Command';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Configure the tags for the server.',
      subParent: {
        subCommands: ['enable', 'config', 'disable'],
        prompt:
          'would you like to `add`, `delete`, `edit`, `info` or `list` tags to/from server? (enter the according option)'
      },
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run() {}
}
