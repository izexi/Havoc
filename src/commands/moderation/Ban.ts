import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Havoc from '../../client/Havoc';
import Util from '../../util/Util';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Bans the inputted user from the server.',
      flags: ['force', 'f'],
      args: [
        {
          required: true,
          type: Target.USER,
          prompt:
            "mention the user / enter the user's ID, tag, nickname or username who you would like to add a role to."
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
      flags: { [flag: string]: undefined };
    }
  ) {
    let response;
    const tag = user.tag;
    if (user.id === message.author.id) {
      await message.react('463993771961483264');
      return message.channel.send('<:WaitWhat:463993771961483264>');
    }
    if (user.id === this.user!.id) {
      await message.react('😢');
      return message.channel.send('😢');
    }
    if (user.id === message.guild!.ownerID)
      response = `${tag} is the owner of this server, therefore I do not have permission to ban this user.`;

    const member = await message.guild!.members.fetch(user).catch(() => null);
    if (member) {
      const highestRole = message.member!.roles.highest;
      const highestMemberRole = member.roles.highest;
      const highestMeRole = message.guild!.me!.roles.highest;
      if (highestMeRole.comparePositionTo(highestMemberRole) < 1) {
        response = `${tag} has the role \`${highestMemberRole.name}\` which has a higher / equivalent position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to ban this user.`;
      }
      if (
        highestRole.comparePositionTo(highestMemberRole) < 1 &&
        message.author.id !== message.guild!.ownerID
      ) {
        response = `${tag} has the role \`${highestMemberRole.name}\` which has a higher / equivalent position compared to your highest role \`${highestRole.name}\`, therefore you do not have permission to ban this user.`;
      }
    }

    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    const existing = await message.guild!.fetchBan(user).catch(() => null);
    if (existing)
      return message.respond(`${tag} is already banned in this server.`);

    if (
      Util.inObj(flags, 'force', 'f') ||
      (await message.confirmation(
        `ban \`${user.tag}\` permanently from \`${message.guild!.name}\``
      ))
    ) {
      await message.guild!.members.ban(user, {
        reason: `Banned by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`,
        days: 7
      });
      message.sendEmbed({
        setDescription: `**${message.author.tag}** I have banned \`${
          user.tag
        }\` from \`${message.guild!.name}\`${
          reason ? ` for the reason ${reason}` : '.'
        } 🔨`
      });
    }
  }
}
