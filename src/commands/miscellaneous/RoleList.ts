import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View a list of roles on this server.',
      aliases: ['rl', 'roles', 'roleslist'],
      requiredPerms: 'MANAGE_ROLES'
    });
  }

  async run({ message }: { message: HavocMessage }) {
    const roles = message.guild?.roles.cache
      .filter(({ id }) => id !== message.guild?.id)
      .sort((prev, curr) => curr.position - prev.position)!;

    message.paginate({
      title: `List of ${roles.size} ${Util.plural('role', roles.size)} in ${
        message.guild!.name
      }`,
      descriptions: roles.map(
        role => `• **${role.name}**
                  (${role} - ${role.id})`
      ),
      maxPerPage: 20,
      page: Number(message.arg)
    });
  }
}
