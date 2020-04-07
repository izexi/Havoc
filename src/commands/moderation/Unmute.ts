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

    let response;
    if (member.id === this.user!.id) {
      await message.react('😢');
      return message.channel.send('😢');
    }

    const highestMeRole = message.guild!.me!.roles.highest;
    const highestMemberRole = message.member!.roles.highest;
    const tag = member.user.tag;
    if (highestMeRole.comparePositionTo(muteRole) < 1)
      response = `the \`HavocMute\` role has a higher position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to unmute \`${tag}\`.`;
    if (
      highestMemberRole.comparePositionTo(muteRole) < 1 &&
      message.author.id !== message.guild!.ownerID
    )
      response = `the \`HavocMute\` role has a higher position compared to your highest role \`${highestMemberRole.name}\`, therefore you do not have permission to unmute \`${tag}\`.`;

    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    if (!member.roles.cache.has(muteRole.id))
      return message.respond(`\`${tag}\` is not muted.`);

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
      `I have unmuted \`${tag}\`${
        reason ? ` due to the reason: \`${reason}\`` : ''
      }`
    );
  }
}
