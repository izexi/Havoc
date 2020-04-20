import HavocGuild from '../structures/extensions/HavocGuild';
import HavocRole from '../structures/extensions/HavocRole';
import Util from '../util/Util';

export default async function(outdated: HavocRole, updated: HavocRole) {
  const guild = updated.guild as HavocGuild;
  if (!guild || guild.logs?.disabled.includes(17)) return;

  let embed;

  if (outdated.name !== updated.name) {
    embed = {
      addFields: [
        { name: '**⤴ Old role name :**', value: outdated.name },
        {
          name: '**⤵ New role name :**',
          value: updated.name
        }
      ],
      setAuthor: `Role ${outdated.name}'s name was changed`
    };
  }

  if (outdated.permissions.bitfield !== updated.permissions.bitfield) {
    const gainedPerms = outdated.permissions.missing(updated.permissions);
    const lostPerms = updated.permissions.missing(outdated.permissions);
    let fields = [];

    if (outdated.permissions.has(8) && updated.permissions.has(8)) {
      fields.push({
        name: '**📝 Permissions :**',
        value:
          'Member still has **`Administrator`** permissions, so they still have all other permissions'
      });
    } else if (!outdated.permissions.has(8) && updated.permissions.has(8)) {
      fields.push({
        name: '**📝 Permissions gained :**',
        value:
          '**`Administrator`** permission granted, which grants the member to all other permissions.'
      });
    } else if (gainedPerms.length) {
      fields.push({
        name: '**📝 Permissions gained :**',
        value: Util.codeblock(
          outdated.permissions
            .missing(updated.permissions)
            .sort()
            .map(perm => `+ ${Util.normalizePermFlag(perm)}`)
            .join('\n'),
          'diff'
        )
      });
    } else if (lostPerms.length) {
      fields.push({
        name: '**📝 Permissions lost :**',
        value: Util.codeblock(
          updated.permissions
            .missing(outdated.permissions)
            .sort()
            .map(perm => `- ${Util.normalizePermFlag(perm)}`)
            .join('\n'),
          'diff'
        )
      });
    }
    embed = {
      setAuthor: `Role ${outdated.name}'s permissions were updated`,
      addFields: fields
    };
  }

  if (outdated.mentionable !== updated.mentionable) {
    embed = {
      setColor: updated.mentionable ? 'GREEN' : 'RED',
      setAuthor: `Role ${updated.name} is ${
        updated.mentionable ? 'now' : 'no longer'
      } mentionable`
    };
  }

  if (outdated.hoist !== updated.hoist) {
    embed = {
      setColor: updated.hoist ? 'GREEN' : 'RED',
      setAuthor: `Role ${updated.name} is ${
        updated.mentionable ? 'now' : 'no longer'
      } hoisted`
    };
  }

  if (outdated.color !== updated.color) {
    embed = {
      addFields: [
        {
          name: '**✏ Old role color :**',
          value:
            outdated.hexColor === '#000000'
              ? 'Default colour'
              : outdated.hexColor
        },
        {
          name: '**🖌 New role color :**',
          value:
            updated.hexColor === '#000000' ? 'Default colour' : updated.hexColor
        }
      ],
      setAuthor: `Role ${outdated.name}'s colour was changed`
    };
  }

  if (embed) {
    embed.addFields!.push({
      name: '**📆 Role created at :**',
      value: `${updated.createdAt.toLocaleString()} (UTC)`
    });
    if (!embed.setColor) embed.setColor = 'ORANGE';

    guild.sendLog({
      ...embed,
      setAuthor: [embed.setAuthor, guild.iconURL()]
    });
  }
}
