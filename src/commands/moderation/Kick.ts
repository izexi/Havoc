import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import Havoc from '../../client/Havoc';
import Util from '../../util';
import HavocGuildMember from '../../structures/extensions/HavocGuildMember';
import { PROMPT_INITIAL, EMOJIS } from '../../util/CONSTANTS';
import { mem } from 'node-os-utils';

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
          prompt: PROMPT_INITIAL[Target.MEMBER]('you would like to kick')
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
      member: HavocGuildMember;
      text: string;
      flags: { force?: undefined; f?: undefined };
    }
  ) {
    if (await message.checkTarget(member.id)) return;

    const response = message.member.can('kick', member);
    if (response) {
      await message.safeReact(EMOJIS.DENIED);
      return message.respond(response);
    }

    if (
      Util.inObj(flags, 'force', 'f') ||
      (await message.confirmation(
        `kick \`${member.user.tag}\` from \`${message.guild!.name}\``
      ))
    ) {
      await member.kick(
        `Kicked by ${message.author.tag}${
          reason ? ` for the reason ${reason}` : ''
        }`
      );
      await message.sendEmbed({
        setDescription: `**${message.author.tag}** I have kicked \`${
          member.user.tag
        }\` from \`${message.guild!.name}\`${
          reason ? ` for the reason ${reason}` : '.'
        } ${EMOJIS.KICKED}`
      });

      message.guild!.sendModLog({ message, reason, target: member });
    }
  }
}
