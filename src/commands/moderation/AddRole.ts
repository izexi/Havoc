import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { GuildMember } from 'discord.js';
import HavocRole from '../../structures/extensions/HavocRole';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Adds the inputted role to a member (with an optional reason).',
      aliases: ['ar', 'sr'],
      args: [
        {
          required: true,
          type: Target.MEMBER,
          prompt:
            "mention the member / enter the member's ID, tag, nickname or username who you would like to add a role to."
        },
        {
          required: true,
          type: Target.ROLE,
          prompt:
            "mention the role / enter the role's ID or name that you would like to add to the member."
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
    role: HavocRole;
    text: string;
  }) {
    const response = role.canBe('added', member);
    if (response) return message.respond(response);

    await member.roles.add(
      role,
      `Added by ${message.author.tag}${
        reason ? ` for the reason ${reason}` : ''
      }`
    );
    message.respond(
      `I have added the role \`${role.name}\` to ${member.user.tag}${
        reason ? ` for the reason \`${reason}\`` : ''
      }.`
    );
  }
}
