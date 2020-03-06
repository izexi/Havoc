import HavocMessage from '../structures/extensions/HavocMessage';
import HavocGuild from '../structures/extensions/HavocGuild';
import { MessageMentions, GuildMember } from 'discord.js';
import Regex from './Regex';
import Havoc from '../client/Havoc';
import HavocUser from '../structures/extensions/HavocUser';

export enum Target {
  USER = 'user',
  MEMBER = 'member',
  ROLE = 'role',
  EMOJI = 'emoji'
}

export const Targetter = {
  [Target.USER]: {
    async mentionOrIDSearch(query: string, client: Havoc) {
      if (!query) return null;
      const [target] =
        query.match(
          `(${MessageMentions.USERS_PATTERN})|(${Regex.id.source})`
        ) ?? [];
      if (!target) return null;
      return client.users.fetch(target.match(/\d+/)![0]).catch(() => null);
    },
    async nameSearch(query: string, guild: HavocGuild | null) {
      if (!guild || !query) return null;
      const findFn = (member: GuildMember) =>
        member.user.tag === query || member.user.username === query;
      return (
        guild.members.cache.find(findFn) ||
        guild.members
          .fetch()
          .then(
            members =>
              members.find(
                member =>
                  findFn(member) || member.displayName.toLowerCase() === query
              ) || null
          )
          .catch(() => null) ||
        null
      );
    },
    async get(query: string, message: HavocMessage) {
      return (
        (await this.mentionOrIDSearch(query, message.client)) ||
        (await this.nameSearch(query, message.guild))
      );
    }
  },

  async parse(
    message: HavocMessage
  ): Promise<{ [Target.USER]?: HavocUser | null }> {
    const parsed = {};
    for (const { type } of message.command!.args!) {
      Object.assign(parsed, {
        // @ts-ignore
        [type]: await Targetter[type].get(message.args[0], message)
      });
    }
    return parsed;
  }
};
