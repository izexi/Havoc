import HavocGuild from '../structures/extensions/HavocGuild';
import HavocUser from '../structures/extensions/HavocUser';

export default async function(guild: HavocGuild, user: HavocUser) {
  if (!guild || guild.logs?.disabled.includes(11)) return;

  guild.sendLog({
    setColor: 'GREEN',
    setAuthor: [`${user.tag} was unbanned`, guild.iconURL()],
    setFooter: `User ID: ${user.id}`
  });
}
