import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import { GuildMember } from 'discord.js';
import HavocRole from '../../structures/extensions/HavocRole';
import { PROMPT_INITIAL, EMOJIS } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Removes the inputted role to a member.',
      aliases: ['rr'],
      args: [
        {
          required: true,
          type: Target.MEMBER,
          prompt: PROMPT_INITIAL[Target.MEMBER](
            ' you would like to remove a role from'
          ),
        },
        {
          required: true,
          type: Target.ROLE,
          prompt: PROMPT_INITIAL[Target.ROLE]('remove from the member'),
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
    const response = role.canBe('removed', member);
    if (response) {
      await message.safeReact(EMOJIS.DENIED);
      return message.respond(response);
    }

    await member.roles.remove(
      role,
      `Removed by ${message.author.tag}${
        reason ? ` for the reason ${reason}` : ''
      }`
    );

    message.respond(
      `I have removed the role \`${role.name}\` from ${member.user.tag}${
        reason ? ` for the reason \`${reason}\`` : ''
      }.`
    );
  }
}
