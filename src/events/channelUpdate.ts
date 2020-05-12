import { TextChannel } from 'discord.js';
import HavocGuild from '../structures/extensions/HavocGuild';

export default async function (outdated: TextChannel, updated: TextChannel) {
  const guild = updated.guild as HavocGuild;
  if (
    !guild ||
    guild.logs?.disabled.includes(2) ||
    (outdated.topic === updated.topic && outdated.name === updated.name)
  )
    return;

  const addFields = [];
  if (outdated.topic !== updated.topic)
    addFields.push(
      {
        name: '**📝Old Channel topic :**',
        value: outdated.topic || '`No topic set.`',
      },
      {
        name: '**✏ New Channel topic :**',
        value: updated.topic || '`No topic set.`',
      }
    );
  if (outdated.name !== updated.name) {
    addFields.push(
      { name: '**📝 Old Channel name :**', value: outdated.name },
      { name: '**✏ New Channel name :**', value: updated.name }
    );
  }

  guild.sendLog({
    addFields,
    setColor: 'ORANGE',
    setAuthor: [
      `Channel was updated${
        updated.parent ? ` in category ${updated.parent.name}` : ''
      }`,
      guild.iconURL(),
    ],
    setFooter: `Channel ID: ${updated.id}`,
  });
}
