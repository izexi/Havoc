import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';
import HavocRole from '../../structures/extensions/HavocRole';
import util from '../../util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'View info about a role.',
      aliases: ['rinfo', 'role'],
      args: {
        type: Target.ROLE,
        required: true,
        prompt: PROMPT_INITIAL[Target.ROLE]('to view info about'),
      },
      requiredPerms: ['VIEW_AUDIT_LOG', 'MANAGE_ROLES'],
    });
  }

  async run({ message, role }: { message: HavocMessage; role: HavocRole }) {
    await message.guild?.members.fetch();
    await message.respond({
      setColor: role.color ? role.hexColor : message.member.displayHexColor,
      addFields: [
        { name: '❯ID', value: role.id, inline: false },
        { name: '❯Name', value: role.name, inline: true },
        {
          name: '❯Members',
          value: `${role.members.size} (You can view a list of all members by doing \`${message.prefix}memberlist ${role.id}\`)`,
          inline: false,
        },
        {
          name: '❯Colour',
          value: role.color ? role.hexColor : 'No colour set.',
          inline: false,
        },
        {
          name: '❯Hoisted',
          value: role.hoist ? 'Yes' : 'No',
          inline: true,
        },
        {
          name: '❯Mentionable',
          value: role.mentionable ? 'Yes' : 'No',
          inline: true,
        },
        {
          name: '❯Permissions',
          value: role.permissions.has(8)
            ? '`Administrator` (which grants all permissions)'
            : util.codeblock(
                Object.entries(role.permissions.serialize())
                  .sort(([, prev], [, curr]) => Number(curr) - Number(prev))
                  .map(
                    ([perm, bool]) =>
                      `${bool ? '+' : '-'} ${util.normalizePermFlag(perm)}`
                  )
                  .join('\n'),
                'diff'
              ),
          inline: false,
        },
      ],
    });
  }
}
