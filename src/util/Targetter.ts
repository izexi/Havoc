import {
  MessageMentions,
  GuildMember,
  User,
  Role,
  GuildEmoji
} from 'discord.js';
import HavocMessage from '../structures/extensions/HavocMessage';
import HavocGuild from '../structures/extensions/HavocGuild';
import Regex from './Regex';
import Havoc from '../client/Havoc';
import HavocTextChannel from '../structures/extensions/HavocTextChannel';
import { Emoji, find } from 'node-emoji';

export enum Target {
  USER = 'user',
  MEMBER = 'member',
  CHANNEL = 'channel',
  ROLE = 'role',
  EMOJI = 'emoji',
  TEXT = 'text',
  NUMBER = 'number',
  FUNCTION = 'function'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TargetFn = (message: HavocMessage) => any;
export type TargetType = Target | TargetFn;

export interface Targets {
  user: User;
  member: GuildMember;
  channel: HavocTextChannel;
  role: Role;
  emoji: GuildEmoji | Emoji;
  number: number;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function: any;
}

type NotFound = null | undefined;

export const Targetter: {
  [target in Target]?: {
    mentionOrIDSearch?(
      query: string,
      client: Havoc
    ): Promise<Targets[target] | NotFound>;
    nameSearch?(
      query: string,
      guild: HavocGuild | null
    ): Promise<Targets[target] | NotFound>;
    get(
      message: HavocMessage,
      arg?: string,
      fn?: TargetFn
    ): Promise<Targets[target] | NotFound>;
  };
} = {
  [Target.USER]: {
    async mentionOrIDSearch(query, client) {
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
    async get(message, query) {
      return (
        (await this.mentionOrIDSearch!(
          query || message.content,
          message.client
        )) || (await this.nameSearch!(query || message.content, message.guild))
      );
    }
  },

  [Target.TEXT]: {
    async get(message: HavocMessage) {
      return message.args.join(' ');
    }
  },

  [Target.EMOJI]: {
    async get(message, query) {
      const arg = query || message.content;
      const [emojiID] =
        arg.match(`(${Regex.emoji})|(${Regex.id.source})`) ?? [];
      return message.guild?.emojis.cache.get(emojiID) || find(arg);
    }
  },

  [Target.FUNCTION]: {
    async get(message, _, fn) {
      return fn!.call(message.client, message);
    }
  }
};

export async function resolveTarget(
  obj: { [key: string]: HavocMessage | Targets[keyof Targets] },
  target: TargetType,
  message: HavocMessage,
  query?: string
) {
  let found;
  if (typeof target === 'function') {
    found = await Targetter[Target.FUNCTION]!.get(message, '', target);
    obj[Target.FUNCTION] = found;
  } else {
    found = await Targetter[target]!.get(message, query);
    obj[target] = found;
  }
  return found;
}
