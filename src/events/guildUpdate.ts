import HavocGuild from '../structures/extensions/HavocGuild';
import ms = require('ms');
import Havoc from '../client/Havoc';

export default async function(
  this: Havoc,
  outdated: HavocGuild,
  updated: HavocGuild
) {
  if (updated.logs?.disabled.includes(7)) return;

  let changed;

  if (outdated.name !== updated.name) {
    changed = {
      addFields: [
        { name: '**⤴ Old name :**', value: outdated.name },
        { name: '**⤵ New name :**', value: updated.name }
      ],
      setAuthor: 'Server name was changed'
    };
  } else if (outdated.afkChannelID !== updated.afkChannelID) {
    changed = {
      addFields: [
        {
          name: '**⤴ Old AFK Channel :**',
          value: outdated.afkChannel?.name ?? 'No AFK Channel'
        },
        {
          name: '**⤵ New AFK Channel :**',
          value: updated.afkChannel?.name ?? 'No AFK Channel'
        }
      ],
      setAuthor: 'Server AFK Channel was changed'
    };
  } else if (outdated.afkTimeout !== updated.afkTimeout) {
    changed = {
      addFields: [
        {
          name: '**⤴ Old AFK timeout :**',
          value: ms(outdated.afkTimeout * 1000, { long: true })
        },
        {
          name: '**⤵ New AFK timeout :**',
          value: ms(updated.afkTimeout * 1000, { long: true })
        }
      ],
      setAuthor: 'Server AFK timeout was changed'
    };
  } else if (outdated.explicitContentFilter !== updated.explicitContentFilter) {
    const filters = {
      DISABLED: "Don't scan any messages.",
      MEMBERS_WITHOUT_ROLES: 'Scan messages from members without a role.',
      ALL_MEMBERS: 'Scan messages sent by all members.'
    };
    changed = {
      addFields: [
        {
          name: '**⤴ Old Explicit Media Content Filter :**',
          value: filters[outdated.explicitContentFilter]
        },
        {
          name: '**⤵ New Explicit Media Content Filter :**',
          value: filters[updated.explicitContentFilter]
        }
      ],
      setAuthor: 'Server Explicit Media Content Filter was changed'
    };
  } else if (outdated.verificationLevel !== updated.verificationLevel) {
    const levels = {
      NONE: 'None : Unrestricted',
      LOW: 'Low : Must have a verified email on their Discord account.',
      MEDIUM:
        'Medium : Must also be a member of this server for longer than 10 minutes.',
      HIGH:
        '(╯°□°）╯︵ ┻━┻ : Must also be a member of this server for longer than 10 minutes.',
      VERY_HIGH:
        '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻ : Must have a verified phone on their Discord account.'
    };
    changed = {
      addFields: [
        {
          name: '**⤴ Old verification level :**',
          value: levels[outdated.verificationLevel]
        },
        {
          name: '**⤵ New verification level :**',
          value: levels[updated.verificationLevel]
        }
      ],
      setAuthor: 'Server verification level was changed'
    };
  } else if (outdated.icon !== updated.icon) {
    changed = {
      addFields: [
        {
          name: '**⤴ Old icon :**',
          value: outdated.icon ? outdated.iconURL() : 'None set'
        },
        {
          name: '**⤵ New icon :**',
          value: updated.icon ? updated.iconURL() : 'None set'
        }
      ],
      setAuthor: 'Server icon was changed'
    };
  } else if (outdated.ownerID !== updated.ownerID) {
    changed = {
      addFields: [
        {
          name: '**⤴ Old owner :**',
          value: await this.users.fetch(outdated.ownerID).then(({ tag }) => tag)
        },
        {
          name: '**⤵ New owner :**',
          value: await this.users.fetch(updated.ownerID).then(({ tag }) => tag)
        }
      ],
      setAuthor: 'Server owner was changed'
    };
  }

  if (changed)
    updated.sendLog({
      ...changed,
      setColor: 'ORANGE',
      setFooter: `Server ID: ${updated.id}`,
      setAuthor: [changed.setAuthor, updated.iconURL()]
    });
}
