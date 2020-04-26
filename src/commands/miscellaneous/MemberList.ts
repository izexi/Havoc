import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util/Util';
import { Target } from '../../util/Targetter';
import { Role } from 'discord.js';
import { PROMPT_INITIAL } from '../../util/Constants';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View a list of members on this server.',
      aliases: ['ml', 'members', 'memberslist'],
      args: {
        required: true,
        type: Target.ROLE,
        prompt: PROMPT_INITIAL[Target.ROLE]('list members from')
      }
    });
  }

  async run({ message, role }: { message: HavocMessage; role: Role }) {
    const members = await message
      .guild!.members.fetch()
      .then(() => role.members);

    message.paginate({
      title: `List of ${members.size} ${Util.plural(
        'member',
        members.size
      )} that have the role \`${role.name}\``,
      descriptions: members.map(
        member =>
          `• **${member.displayName}**
             (${member.user.tag} - ${member.user.id})`
      ),
      maxPerPage: 20,
      page: Number(message.arg)
    });
  }
}
