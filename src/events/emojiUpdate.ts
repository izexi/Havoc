import { GuildEmoji } from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function(outdated: GuildEmoji, updated: GuildEmoji) {
  const guild = updated.guild as HavocGuild;
  if (
    !guild ||
    guild.logs?.disabled.includes(6) ||
    outdated.name === updated.name
  )
    return;

  guild.sendLog({
    addFields: [
      {
        name: '**📝 Old Emoji name :**',
        value: outdated.name
      },
      {
        name: '**✏ New Emoji name :**',
        value: updated.name
      },
      {
        name: '**📅 Timestamp of creation :**',
        value: `${updated.createdAt.toLocaleString()} (UTC)`
      },
      { name: '**🔎 Emoji URL :**', value: updated.url }
    ],
    setColor: 'ORANGE',
    setAuthor: ['Emoji was updated', guild.iconURL()],
    setFooter: `Emoji ID: ${updated.id}`
  });
}
