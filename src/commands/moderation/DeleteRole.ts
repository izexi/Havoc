import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { Role } from 'discord.js';
import Util from '../../util/Util';

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
    role: Role;
    text: string;
    flags: { force?: undefined; f?: undefined };
  }) {
    let response;
    if (role.managed)
      response = `the role \`${role.name}\` is a managed role, therefore I do not have permission to delete this role.`;
    const highestMeRole = message.guild!.me!.roles.highest;
    const highestMemberRole = message.member!.roles.highest;
    if (highestMeRole.comparePositionTo(role) < 1)
      response = `the role \`${role.name}\` which has a higher / equivalent position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to delete this role.`;
    if (
      highestMemberRole.comparePositionTo(role) < 1 &&
      message.author.id !== message.guild!.ownerID
    )
      response = `the role \`${role.name}\` which has a higher / equivalent position compared to your highest role \`${highestMemberRole.name}\`, therefore you do not have permission to delete this role.`;

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
