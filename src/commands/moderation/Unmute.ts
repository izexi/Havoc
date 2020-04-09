import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import { GuildMember } from 'discord.js';
import Havoc from '../../client/Havoc';
import { getMuteRole } from './Mute';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Unmutes (no longer restricts from sending and reacting to messages) the inputted member from the server.',
      aliases: ['um'],
      args: [
        {
          required: true,
          type: Target.MEMBER,
          prompt:
            "mention the member / enter the member's ID, tag, nickname or username who you would like to unmute."
        },
        {
          type: Target.TEXT
        }
      ],
      requiredPerms: 'MANAGE_ROLES'
    });
  }

  async run(
    this: Havoc,
    {
      message,
      member,
      text: reason
    }: {
      message: HavocMessage;
      member: GuildMember;
      text: string;
    }
  ) {
    const muteRole = await getMuteRole(message.guild!);
    if (!muteRole) return;

    if (member.id === this.user!.id) {
      await message.react('😢');
      return message.channel.send('😢');
    }

    const response = message.member.can('unmute', member);
    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    if (!member.roles.cache.has(muteRole.id))
      return message.respond(`\`${member.user.tag}\` is not muted.`);

    await member.roles.remove(
      muteRole,
      `Unmuted by ${message.author.tag}${
        reason ? ` due to the reason: ${reason}` : ''
      }`
    );

    const guild = await this.db.guildRepo.findOne(
      {
        mutes: {
          guild: message.guild!.id,
          member: member.id
        }
      },
      { populate: ['mutes'] }
    );
    const mutes = await guild?.mutes.init();
    const mute = mutes?.getItems().find(mute => mute.member === member.id);

    if (mute) await this.schedules.mute.dequeue(mute, mutes!);

    message.respond(
      `I have unmuted \`${member.user.tag}\`${
        reason ? ` due to the reason: \`${reason}\`` : ''
      }`
    );
  }
}
