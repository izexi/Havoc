import HavocGuild from '../structures/extensions/HavocGuild';
import HavocUser from '../structures/extensions/HavocUser';
import { EmbedMethods } from '../structures/extensions/HavocMessage';
import { NOOP } from '../util/CONSTANTS';

export default async function (guild: HavocGuild, user: HavocUser) {
  if (!guild || guild.logs?.disabled.includes(8)) return;

  const banReason = await guild
    .fetchBan(user)
    .then(({ reason }) => reason, NOOP);

  const embed: Partial<EmbedMethods> = {
    setColor: 'RED',
    setAuthor: [`${user.tag} was banned`, guild.iconURL()],
    setFooter: `User ID: ${user.id}`,
  };
  if (banReason) embed.addField = ['**💬 Reason :**', banReason];

  guild.sendLog(embed);
}
