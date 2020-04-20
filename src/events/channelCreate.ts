import {
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  NewsChannel
} from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function(
  channel: TextChannel | VoiceChannel | CategoryChannel | NewsChannel
) {
  const guild = channel.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(0)) return;

  const muteRole = guild.roles.cache.find(role => role.name === 'HavocMute');
  if (muteRole && (channel.type === 'text' || channel.type === 'category')) {
    await channel.updateOverwrite(muteRole, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false
    });
  }

  guild.sendLog({
    addFields: [
      {
        name: '**📅 Timestamp of creation :**',
        value: `${channel.createdAt.toLocaleString()} (UTC)`
      },
      { name: '** 📂Channel name:**', value: channel.name },
      { name: '**📣 Channel type :**', value: channel.type }
    ],
    setColor: 'GREEN',
    setAuthor: [
      `Channel was created${
        channel.parent ? ` in category ${channel.parent.name}` : ''
      }`,
      guild.iconURL()
    ],
    setFooter: `Channel ID: ${channel.id}`
  });
}
