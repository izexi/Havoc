import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Havoc from '../../client/Havoc';
import { GuildMember } from 'discord.js';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Changes the nickname of inputted member to the inputted new nickname.',
      args: [
        {
          type: Target.MEMBER,
          required: true,
          prompt:
            "mention the user / enter the users's ID, tag, nickname or username who's nickname you would like to change."
        },
        {
          type: Target.TEXT,
          required: true,
          prompt: 'enter the nickname.'
        }
      ],
      requiredPerms: 'MANAGE_NICKNAMES'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      member,
      text: nick
    }: {
      message: HavocMessage;
      member: GuildMember;
      text: string;
    }
  ) {
    let response;
    const tag = member.user.tag;
    if (member.id === message.guild!.ownerID)
      response = `${member.user.tag} is the owner of this server, therefore I do not have permission to change this member's nickname.`;

    const highestRole = message.member!.roles.highest;
    const highestMemberRole = member.roles.highest;
    const highestMeRole = message.guild!.me!.roles.highest;
    if (highestMeRole.comparePositionTo(highestMemberRole) < 1) {
      response = `${tag} has the role \`${highestMemberRole.name}\` which has a higher / equivalent position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to change their nickname.`;
    }
    if (
      highestRole.comparePositionTo(highestMemberRole) < 1 &&
      message.author.id !== message.guild!.ownerID
    ) {
      response = `${tag} has the role \`${highestMemberRole.name}\` which has a higher / equivalent position compared to your highest role \`${highestRole.name}\`, therefore you do not have permission to change their nickname.`;
    }

    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    const oldNick = member.displayName;
    const newNick = nick.substring(0, 32);
    await member.setNickname(newNick);
    message.respond(
      `I have changed \`${tag}\`'s nickname from \`${oldNick}\` to \`${newNick}\``
    );
  }
}
