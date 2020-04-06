import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import Havoc from '../../client/Havoc';
import { GuildMember, Guild } from 'discord.js';
import HavocGuild from '../../structures/extensions/HavocGuild';
import ms = require('ms');

export async function getMuteRole(guild?: HavocGuild | Guild) {
  if (!guild) return;
  const muteRole =
    guild.roles.cache.find(r => r.name === 'HavocMute') ||
    (await guild.roles.create({
      data: {
        name: 'HavocMute',
        position: guild.me!.roles.highest.position - 1
      }
    }));

  if (muteRole) {
    const promises = guild.channels.cache
      .filter(channel => channel.type === 'text' || channel.type === 'category')
      .map(channel => {
        const currentMutePerms = channel.permissionOverwrites.get(muteRole!.id);
        if (!currentMutePerms || currentMutePerms.deny.bitfield !== 2112) {
          return channel
            .updateOverwrite(muteRole!, {
              SEND_MESSAGES: false,
              ADD_REACTIONS: false
            })
            .catch(() => null);
        }
      });
    await Promise.all(promises);
  }
  return muteRole;
}

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Mutes (restricts from sending and reacting to messages) the inputted member from the server.',
      aliases: ['m', 'shhh', 'stfu'],
      args: [
        {
          type: Target.TIME,
          promptOpts: {
            initial:
              'enter the duration how long the memebr should be muted for, suffix the time with `w`/`d`/`h`/`m`/`s`, e.g: `3m5s` would be 3 minutes and 5 seconds.',
            invalid:
              'You need to a enter a valid time format. `5h30m5s` would be 5 hours, 30 minutes and 5 seconds for example'
          }
        },
        {
          type: Target.MEMBER,
          required: true,
          prompt:
            "mention the member / enter the member's ID, tag, nickname or username who you would like to mute."
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
      time,
      member,
      text: reason
    }: {
      message: HavocMessage;
      time: number;
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
    if (highestMeRole.comparePositionTo(muteRole) < 1)
      response = `the \`HavocMute\` role has a higher position compared to my highest role \`${highestMeRole.name}\`, therefore I do not have permission to mute msg user.`;
    if (
      highestMemberRole.comparePositionTo(muteRole) < 1 &&
      message.author.id !== message.guild!.ownerID
    )
      response = `the \`HavocMute\` role has a higher position compared to your highest role \`${highestMemberRole.name}\`, therefore you do not have permission to mute msg user.`;

    if (response) {
      await message.react('⛔');
      return message.respond(response);
    }

    if (member.roles.cache.has(muteRole.id))
      return message.respond(`\`${member.user.tag}\` is already muted.`);

    await this.schedules.get('mute')?.start(message.guild!, {
      end: time ? new Date(Date.now() + time) : undefined,
      member: member.id,
      muter: message.author.id,
      reason
    });

    await member.roles.add(
      muteRole,
      `Muted by ${message.author.tag}${
        time ? ` for ${ms(time, { long: true })}` : ''
      }${reason ? ` due to the reason: ${reason}` : ''}`
    );

    message.respond(
      `I have muted \`${member.user.tag}\`${
        time ? ` for ${ms(time, { long: true })}` : ''
      }${reason ? ` due to the reason: \`${reason}\`` : ''} 🙊`
    );
  }
}
