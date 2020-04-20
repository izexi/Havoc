import HavocGuild from '../structures/extensions/HavocGuild';
import HavocRole from '../structures/extensions/HavocRole';

export default async function(role: HavocRole) {
  const guild = role.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(17)) return;

  guild.sendLog({
    addFields: [
      {
        name: '**📅 Timestamp of creation :**',
        value: `${role.createdAt.toLocaleString()} (UTC)`
      },
      { name: '** 📂 Role name:**', value: role.name }
    ],
    setColor: 'RED',
    setAuthor: ['Role was deleted', guild.iconURL()],
    setFooter: `Role ID: ${role.id}`
  });
}
