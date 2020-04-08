import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { Role, GuildMember } from 'discord.js';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Removes the inputted role to a member.',
      aliases: ['rr'],
      args: [
        {
          required: true,
          type: Target.MEMBER,
          prompt:
            "mention the member / enter the member's ID, tag, nickname or username who you would like to remove a role from."
        },
        {
          required: true,
          type: Target.ROLE,
          prompt:
            "mention the role / enter the role's ID or name that you would like to remove from the member."
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
    member,
    role,
    text: reason
  }: {
    message: HavocMessage;
    member: GuildMember;
    role: Role;
    text: string;
  }) {
    let response;
    const tag = member.user.tag;
    if (message.guild!.me!.roles.highest.comparePositionTo(role) < 1)
      response = `the role \`${
        role.name
      }\` has a higher / equivalent position compared to my highest role \`${
        message.guild!.me!.roles.highest.name
      }\`, therefore I do not have permission to add this role to ${tag}.`;

    if (
      message.member!.roles.highest.comparePositionTo(role) < 1 &&
      message.author.id !== message.guild!.ownerID
    )
      response = `the role \`${
        role.name
      }\` has a higher / equivalent position compared to your highest role \`${
        message.member!.roles.highest.name
      }\`, therefore you do not have permission to add this role to ${tag}.`;

    if (!member.roles.cache.has(role.id))
      response = `${tag} doesn't even have the \`${role.name}\` role.`;

    if (response) return message.respond(response);

    await member.roles.remove(
      role,
      `Removed by ${message.author.tag}${
        reason ? ` for the reason ${reason}` : ''
      }`
    );
    message.respond(
      `I have removed the role \`${role.name}\` from ${tag}${
        reason ? ` for the reason \`${reason}\`` : ''
      }.`
    );
  }
}
