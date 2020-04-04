import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Havoc from '../../client/Havoc';
import Util from '../../util/Util';
import { GuildMember } from 'discord.js';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Kicks the inputted member from the server (with an optional reason).',
      flags: ['force', 'f'],
      args: [
        {
          required: true,
          type: Target.MEMBER,
          prompt:
            "mention the member / enter the member's ID, tag, nickname or username who you would like to kick."
        },
        {
          type: Target.TEXT
        }
      ],
      requiredPerms: 'KICK_MEMBERS'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      member,
      text: reason,
      flags
    }: {
      message: HavocMessage;
      member: GuildMember;
      text: string;
      flags: { force?: undefined; f?: undefined };
    }
  ) {
    let response;
    const tag = member.user.tag;
    if (member.id === message.author.id) {
      await message.react('463993771961483264');
      return message.channel.send('<:WaitWhat:463993771961483264>');
    }
    if (member.id === this.user!.id) {
      await message.react('😢');
      return message.channel.send('😢');
    }
    if (member.id === message.guild!.ownerID)
      response = `${tag} is the owner of this server, therefore I do not have permission to kick this user.`;

    const highestRole = message.member!.roles.highest;
    const highestMemberRole = member.roles.highest;
    const highestMeRole = message.guild!.me!.roles.highest;
    if (highestMeRole.comparePositionTo(highestMemberRole) < 1) {
      response = `${tag} has the role \`${highestMemberRole.name}\` which has a higher / equivalent position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to kick this user.`;
    }
    if (
      highestRole.comparePositionTo(highestMemberRole) < 1 &&
      message.author.id !== message.guild!.ownerID
    ) {
      response = `${tag} has the role \`${highestMemberRole.name}\` which has a higher / equivalent position compared to your highest role \`${highestRole.name}\`, therefore you do not have permission to kick this user.`;
    }

    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    if (
      Util.inObj(flags, 'force', 'f') ||
      (await message.confirmation(
        `kick \`${tag}\` from \`${message.guild!.name}\``
      ))
    ) {
      await member.kick(
        `Kicked by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`
      );
      message.sendEmbed({
        setDescription: `**${
          message.author.tag
        }** I have kicked \`${tag}\` from \`${message.guild!.name}\`${
          reason ? ` for the reason ${reason}` : '.'
        } <:boot3:402540975605678081>`
      });
    }
  }
}
