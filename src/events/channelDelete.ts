import {
  TextChannel,
  VoiceChannel,
  CategoryChannel,
  NewsChannel,
} from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function (
  channel: TextChannel | VoiceChannel | CategoryChannel | NewsChannel
) {
  const guild = channel.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(1)) return;

  guild.sendLog({
    addFields: [
      {
        name: '**📅 Timestamp of creation :**',
        value: `${channel.createdAt.toLocaleString()} (UTC)`,
      },
      { name: '** 📂Channel name:**', value: channel.name },
      { name: '**📣 Channel type :**', value: channel.type },
    ],
    setColor: 'RED',
    setAuthor: [
      `Channel was deleted${
        channel.parent ? ` from category ${channel.parent.name}` : ''
      }`,
      guild.iconURL(),
    ],
    setFooter: `Channel ID: ${channel.id}`,
  });
}
