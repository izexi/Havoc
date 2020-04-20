import HavocGuild from '../structures/extensions/HavocGuild';
import HavocGuildMember from '../structures/extensions/HavocGuildMember';
import Util from '../util/Util';

export default async function(
  outdated: HavocGuildMember,
  updated: HavocGuildMember
) {
  const guild = updated.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(12)) return;

  let embed;

  if (outdated.displayName !== updated.displayName) {
    embed = {
      addFields: [
        { name: '**⤴ Old nickname :**', value: outdated.displayName },
        { name: '**⤵ New nickname :**', value: updated.displayName },
        { name: '**🔎 Member :**', value: updated.toString() }
      ],
      setColor: 'ORANGE',
      setAuthor: [
        `${updated.user.tag}'s nickname was changed`,
        guild.iconURL()
      ],
      setFooter: `User ID: ${updated.id}`
    };
  }

  const rolesDiff = updated.roles.cache.difference(outdated.roles.cache);
  const newPerms = outdated.permissions.missing(updated.permissions);
  const oldPerms = updated.permissions.missing(outdated.permissions);
  const newRolesSize = updated.roles.cache.size;
  const oldRolesSize = outdated.roles.cache.size;

  if (rolesDiff.size) {
    let fields = [];

    const addedRoles = updated.roles.cache.filter(
      role => !outdated.roles.cache.has(role.id)
    );
    if (addedRoles.size)
      fields.push({
        name: `**➕ ${Util.plural('Role', addedRoles.size)} added :**`,
        value: addedRoles.map(String).join(', ')
      });
    const removedRoles = outdated.roles.cache.filter(
      role => !updated.roles.cache.has(role.id)
    );
    if (removedRoles.size)
      fields.push({
        name: `**➖ ${Util.plural('Role', removedRoles.size)} removed :**`,
        value: removedRoles.map(String).join(', ')
      });

    if (outdated.permissions.has(8) && updated.permissions.has(8)) {
      fields.push({
        name: `**📝 Permissions ${
          oldRolesSize < newRolesSize ? 'gained' : 'lost'
        } :**`,
        value:
          'Member still has **`Administrator`** permissions, so they still have all other permissions'
      });
    } else if (!outdated.permissions.has(8) && updated.permissions.has(8)) {
      fields.push({
        name: '**📝 Permissions gained :**',
        value:
          '**`Administrator`** permission granted, which grants the member to all other permissions.'
      });
    } else if (newPerms.length) {
      fields.push({
        name: '**📝Permissions gained :**',
        value: Util.codeblock(
          newPerms
            .sort()
            .map(perm => `+ ${Util.normalizePermFlag(perm)}`)
            .join('\n'),
          'diff'
        )
      });
    } else if (oldPerms.length) {
      fields.push({
        name: '**📝 Permissions lost :**',
        value: Util.codeblock(
          oldPerms
            .sort()
            .map(perm => `- ${Util.normalizePermFlag(perm)}`)
            .join('\n'),
          'diff'
        )
      });
    }

    embed = {
      setAuthor:
        newRolesSize === oldRolesSize
          ? `${updated.user.tag}'s roles were modified`
          : `${
              newRolesSize > oldRolesSize
                ? `${Util.plural('Role', addedRoles.size)} added to`
                : `${Util.plural('Role', removedRoles.size)} removed from`
            } ${updated.user.tag}`,
      addFields: fields,
      setColor:
        newRolesSize === oldRolesSize
          ? 'ORANGE'
          : newRolesSize > oldRolesSize
          ? 'GREEN'
          : 'RED'
    };
  }

  if (embed) guild.sendLog(embed);
}
