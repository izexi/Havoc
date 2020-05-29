import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import Util from '../../util';
import { Target } from '../../util/targetter';
import { Role } from 'discord.js';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View a list of members on this server.',
      aliases: ['ml', 'members', 'memberslist'],
      args: {
        required: true,
        type: Target.ROLE,
        prompt: PROMPT_INITIAL[Target.ROLE]('list members from'),
      },
      requiredPerms: 'VIEW_AUDIT_LOG',
    });
  }

  async run({ message, role }: { message: HavocMessage; role: Role }) {
    const members = await message.guild!.members.fetch().then(() =>
      role.members.map(
        (member) =>
          `• **${member.displayName}**
             (${member.user.tag} - ${member.user.id})`
      )
    );

    if (!members.length)
      return message.respond(
        `there are no members that have the \`${role.name}\` role.`
      );

    message.paginate({
      title: `List of ${members.length} ${Util.plural(
        'member',
        members.length
      )} that have the role \`${role.name}\``,
      descriptions: members,
      maxPerPage: 20,
      page: Number(message.arg),
    });
  }
}
