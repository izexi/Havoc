import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import { PROMPT_INITIAL } from '../../util/CONSTANTS';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Softbans (bans and then immediately unbans) the inputted user from the server (with an optional reason).',
      flags: ['force', 'f'],
      args: [
        {
          required: true,
          type: Target.USER,
          prompt: PROMPT_INITIAL[Target.USER](' you would like to softban')
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
      text: reason,
      flags
    }: {
      message: HavocMessage;
      user: HavocUser;
      text: string;
      flags: { force?: undefined; f?: undefined };
    }
  ) {
    if (user.id === message.author.id) {
      await message.safeReact('463993771961483264');
      return message.channel.send('<:WaitWhat:463993771961483264>');
    }
    if (user.id === this.user!.id) {
      await message.safeReact('😢');
      return message.channel.send('😢');
    }

    const member = await message.guild!.members.fetch(user).catch(() => null);
    const response = member ? message.member.can('softban', member) : null;
    if (response) {
      await message.safeReact('⛔');
      return message.respond(response);
    }

    const existing = await message.guild!.fetchBan(user).catch(() => null);
    if (existing)
      return message.respond(`${user.tag} is already banned in this server.`);

    if (
      Util.inObj(flags, 'force', 'f') ||
      (await message.confirmation(
        `soft \`${user.tag}\` from \`${message.guild!.name}\``
      ))
    ) {
      await message.guild!.members.ban(user, {
        reason: `Softbanned by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`,
        days: 7
      });
      await message.guild!.members.unban(
        user,
        `Softbanned by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`
      );
      await message.sendEmbed({
        setDescription: `**${message.author.tag}** I have softbanned \`${
          user.tag
        }\` from \`${message.guild!.name}\`${
          reason ? ` for the reason ${reason}` : '.'
        } 🔨🩹`
      });

      message.guild!.sendModLog({ message, reason, target: user });
    }
  }
}
