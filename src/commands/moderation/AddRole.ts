import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { GuildMember } from 'discord.js';
import HavocRole from '../../structures/extensions/HavocRole';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

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
          prompt: PROMPT_INITIAL[Target.MEMBER](
            ' you would like to add a role to'
          ),
        },
        {
          required: true,
          type: Target.ROLE,
          prompt: PROMPT_INITIAL[Target.ROLE]('add to the member'),
        },
        {
          type: Target.TEXT,
        },
      ],
      requiredPerms: 'MANAGE_ROLES',
    });
  }

  async run({
    message,
    member,
    role,
    text: reason,
  }: {
    message: HavocMessage;
    member: GuildMember;
    role: HavocRole;
    text: string;
  }) {
    const response = role.canBe('added', message.member);
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
