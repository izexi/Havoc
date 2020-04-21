import { VoiceState } from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';
import Havoc from '../client/Havoc';

export default async function(
  this: Havoc,
  outdated: VoiceState,
  updated: VoiceState
) {
  const guild = updated.guild as HavocGuild;
  if (
    !guild ||
    guild.logs?.disabled.includes(19) ||
    outdated.channel?.id === updated.channel?.id
  )
    return;

  const user = await this.users.fetch(updated.id);
  const fields = [];
  if (outdated.channel && updated.channel)
    fields.push(
      { name: '**⤴ From :**', value: outdated.channel.name },
      { name: '**⤵ To :**', value: updated.channel.name }
    );
  else
    fields.push({
      name: '**🔈 Channel Name :**',
      value: (outdated.channel || updated.channel)?.name ?? ''
    });

  guild.sendLog({
    setAuthor: [
      `${user.tag} ${
        outdated.channel && updated.channel
          ? 'switched voice channels'
          : `${outdated.channel ? 'left' : 'joined'} a voice channel`
      }`,
      user.displayAvatarURL()
    ],
    addFields: fields,
    setColor:
      outdated.channel && updated.channel
        ? 'ORANGE'
        : outdated.channel
        ? 'RED'
        : 'GREEN',
    setFooter: `Voice channel ID: ${(outdated.channel || updated.channel)?.id}`
  });
}
