import {
  MessageMentions,
  GuildMember,
  User,
  Role,
  GuildEmoji,
  GuildChannel
} from 'discord.js';
import HavocMessage from '../structures/extensions/HavocMessage';
import HavocGuild from '../structures/extensions/HavocGuild';
import Regex from './Regex';
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
  FUNCTION = 'fn'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TargetFn = (message: HavocMessage) => any;
export type TargetType = Target | TargetFn;

export interface Targets {
  user: User;
  member: GuildMember;
  channel: GuildChannel | HavocTextChannel;
  role: Role;
  emoji: GuildEmoji | Emoji;
  number: number;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: any;
}

type NotFound = null | undefined;

export const Targetter: {
  [target in Target]?: {
    mentionOrIDSearch?(
      query: string,
      message: HavocMessage
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
    async mentionOrIDSearch(query, message) {
      if (!query) return null;
      const [target] =
        query.match(
          `(${MessageMentions.USERS_PATTERN})|(${Regex.id.source})`
        ) ?? [];
      if (!target) return null;
      return message.client.users
        .fetch(target.match(/\d+/)![0])
        .catch(() => null);
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
        (await this.mentionOrIDSearch!(query || message.text, message)) ||
        (await this.nameSearch!(query || message.text, message.guild))
      );
    }
  },

  [Target.ROLE]: {
    async mentionOrIDSearch(query, message) {
      if (!query) return null;
      const [target] =
        query.match(
          `(${MessageMentions.ROLES_PATTERN})|(${Regex.id.source})`
        ) ?? [];
      if (!target) return null;
      return message.guild?.roles.cache.get(target.match(/\d+/)![0]);
    },
    async nameSearch(query: string, guild: HavocGuild | null) {
      if (!guild || !query) return null;
      return (
        guild.roles.cache.find(
          role =>
            role.name === query ||
            role.name.toLowerCase() === query.toLowerCase()
        ) || null
      );
    },
    async get(message, query) {
      return (
        (await this.mentionOrIDSearch!(query || message.content, message)) ||
        (await this.nameSearch!(query || message.content, message.guild))
      );
    }
  },

  // TODO: Create a utility function for this
  [Target.CHANNEL]: {
    async mentionOrIDSearch(query, message) {
      if (!query) return null;
      const [target] =
        query.match(
          `(${MessageMentions.CHANNELS_PATTERN})|(${Regex.id.source})`
        ) ?? [];
      if (!target) return null;
      return message.guild?.channels.cache.get(target.match(/\d+/)![0]);
    },
    async nameSearch(query: string, guild: HavocGuild | null) {
      if (!guild || !query) return null;
      return (
        guild.channels.cache.find(
          role =>
            role.name === query ||
            role.name.toLowerCase() === query.toLowerCase()
        ) || null
      );
    },
    async get(message, query) {
      return (
        (await this.mentionOrIDSearch!(query || message.content, message)) ||
        (await this.nameSearch!(query || message.content, message.guild))
      );
    }
  },

  [Target.TEXT]: {
    async get(message: HavocMessage) {
      return message.text;
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
