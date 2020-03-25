import { MessageMentions, GuildMember, User, Role, Emoji } from 'discord.js';
import HavocMessage from '../structures/extensions/HavocMessage';
import HavocGuild from '../structures/extensions/HavocGuild';
import Regex from './Regex';
import Havoc from '../client/Havoc';

export enum Target {
  USER = 'user',
  MEMBER = 'member',
  ROLE = 'role',
  EMOJI = 'emoji'
}

interface Targets {
  user: User;
  member: GuildMember;
  role: Role;
  emoji: Emoji;
}

type NotFound = null | undefined;

const Targetter: {
  [key in Target]?: {
    mentionOrIDSearch(
      query: string,
      client: Havoc
    ): Promise<Targets[key] | NotFound>;
    nameSearch(
      query: string,
      guild: HavocGuild | null
    ): Promise<Targets[key] | NotFound>;
    get(arg: string, message: HavocMessage): Promise<Targets[key] | NotFound>;
  };
} = {
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
        guild.members.cache.find(findFn)?.user ||
        guild.members
          .fetch()
          .then(
            members =>
              members.find(
                member =>
                  findFn(member) || member.displayName.toLowerCase() === query
              )?.user
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
  }
};

export async function resolveTarget(
  message: HavocMessage,
  parsed: { [key in Target]?: Targets[key] | NotFound } = {}
) {
  for (const { type } of message.command!.args!) {
    Object.assign(parsed, {
      [type]: await Targetter[type]!.get(message.args[0], message)
    });
  }
  return parsed;
}
