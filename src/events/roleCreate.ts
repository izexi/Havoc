import HavocGuild from '../structures/extensions/HavocGuild';
import HavocRole from '../structures/extensions/HavocRole';

export default async function(role: HavocRole) {
  const guild = role.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(16)) return;

  guild.sendLog({
    addField: [
      '**📅 Timestamp of creation :**',
      `${role.createdAt.toLocaleString()} (UTC)`
    ],
    setColor: 'GREEN',
    setAuthor: ['Role was created', guild.iconURL()],
    setFooter: `Role ID: ${role.id}`
  });
}
