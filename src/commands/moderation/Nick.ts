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
    const response = message.member.can('nick', member);
    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    const oldNick = member.displayName;
    const newNick = nick.substring(0, 32);
    await member.setNickname(newNick);

    message.respond(
      `I have changed \`${member.user.tag}\`'s nickname from \`${oldNick}\` to \`${newNick}\``
    );
  }
}
