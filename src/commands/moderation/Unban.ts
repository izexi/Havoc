import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Unbans the inputted user from the server (with an optional reason).',
      args: [
        {
          required: true,
          type: Target.USER,
          prompt:
            "mention the user / enter the user's ID, tag, nickname or username who you would like to unban."
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
      await message.react('463993771961483264');
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
    message.sendEmbed({
      setDescription: `**${message.author.tag}** I have unbanned \`${
        user.tag
      }\` from \`${message.guild!.name}\`${
        reason ? ` for the reason ${reason}` : '.'
      } 🩹`
    });
  }
}
