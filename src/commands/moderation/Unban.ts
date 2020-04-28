import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Unbans the inputted user from the server (with an optional reason).',
      args: [
        {
          required: true,
          type: Target.USER,
          prompt: PROMPT_INITIAL[Target.USER](' you would like to unban')
        },
        {
          type: Target.TEXT
        }
      ],
      requiredPerms: 'BAN_MEMBERS'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      user,
      text: reason
    }: {
      message: HavocMessage;
      user: HavocUser;
      text: string;
    }
  ) {
    const tag = user.tag;
    if (user.id === message.author.id || user.id === this.user!.id) {
      await message.safeReact('463993771961483264');
      return message.channel.send('<:WaitWhat:463993771961483264>');
    }

    const existing = await message.guild!.fetchBan(user).catch(() => null);
    if (!existing)
      return message.respond(`${tag} is not banned in this server.`);

    await message.guild!.members.unban(
      user,
      `Unbanned by ${message.author.tag}${
        reason ? ` for the reason ${reason}` : ''
      }`
    );
    await message.sendEmbed({
      setDescription: `**${message.author.tag}** I have unbanned \`${
        user.tag
      }\` from \`${message.guild!.name}\`${
        reason ? ` for the reason ${reason}` : '.'
      } 🩹`
    });

    message.guild!.sendModLog({ message, reason, target: user });
  }
}
