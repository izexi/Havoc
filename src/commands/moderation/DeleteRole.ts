import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Util from '../../util/Util';
import HavocRole from '../../structures/extensions/HavocRole';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Adds the inputted role to a member (with an optional reason).',
      aliases: ['dr'],
      flags: ['force', 'f'],
      args: [
        {
          required: true,
          type: Target.ROLE,
          prompt:
            "mention the role / enter the role's ID or name that you would like to delete."
        },
        {
          type: Target.TEXT
        }
      ],
      requiredPerms: 'MANAGE_ROLES'
    });
  }

  async run({
    message,
    role,
    text: reason,
    flags
  }: {
    message: HavocMessage;
    role: HavocRole;
    text: string;
    flags: { force?: undefined; f?: undefined };
  }) {
    const response = role.canBe('deleted');
    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    const members = await message
      .guild!.members.fetch()
      .then(() => role.members);
    const formattedMembers = members
      .map(member => `${member.user.tag} | ${member.id}`)
      .join('\n');
    if (
      Util.inObj(flags, 'force', 'f') ||
      (await message.confirmation(
        `delete the role \`${
          role.name
        }\` which will also remove the role from \`${members.size} member(s)\`
        ${Util[formattedMembers.length > 1700 ? 'haste' : 'codeblock'](
          formattedMembers
        )}`
      ))
    ) {
      await role.delete(
        `Deleted by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`
      );
      message.respond(
        `I have deleted the role \`${role.name}\`${
          reason ? ` for the reason ${reason}` : ''
        }. 🗑`
      );
    }
  }
}
