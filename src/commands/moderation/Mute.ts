import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import Havoc from '../../client/Havoc';
import { GuildMember, Guild } from 'discord.js';
import HavocGuild from '../../structures/extensions/HavocGuild';
import ms = require('ms');
import { PROMPT_INITIAL, NOOP } from '../../util/CONSTANTS';

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
            .catch(NOOP);
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
          prompt: PROMPT_INITIAL[Target.TIME]('mute')
        },
        {
          type: Target.MEMBER,
          required: true,
          prompt: PROMPT_INITIAL[Target.MEMBER]('you would like to mute')
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

    if (member.id === this.user!.id) {
      await message.safeReact('😢');
      return message.channel.send('😢');
    }

    const response = message.member.can('mute', member, false);
    if (response) {
      await message.safeReact('⛔');
      return message.respond(response);
    }

    if (member.roles.cache.has(muteRole.id))
      return message.respond(`\`${member.user.tag}\` is already muted.`);

    await this.schedules.mute.start(message.guild!.id, {
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

    await message.respond(
      `I have muted \`${member.user.tag}\`${
        time ? ` for ${ms(time, { long: true })}` : ''
      }${reason ? ` due to the reason: \`${reason}\`` : ''} 🙊`
    );

    message.guild!.sendModLog({
      message,
      reason,
      target: member,
      duration: time
    });
  }
}
