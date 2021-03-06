import {
  Guild,
  WebhookClient,
  MessageEmbed,
  DiscordAPIError,
  GuildMember,
  User,
} from 'discord.js';
import HavocMessage, { EmbedMethods } from './HavocMessage';
import Util from '../../util';
import HavocTextChannel from './HavocTextChannel';
import GuildEntity from '../entities/GuildEntity';
import Havoc from '../../client/Havoc';
import ms = require('ms');
import {
  MODLOGS_COLOUR,
  NOOP,
  HAVOC_LOGS_AVATAR,
  GUILD_CONFIGS,
} from '../../util/CONSTANTS';

const DEFAULT_CONFIGS: {
  [key: string]: string | string[] | Map<string, string>;
} = {
  prefix: process.env.PREFIX!,
  bcPrefixes: ['!', '.', '?'],
  tags: new Map(),
};

export default class extends Guild {
  client!: Havoc;

  prefix!: string;

  tags!: Map<string, string>;

  bcPrefixes!: string[];

  logs?: {
    disabled: number[];
    channel: string;
    webhook: {
      id: string;
      token: string;
    };
  };

  modlogs?: string;

  autorole?: string;

  welcomer?: string;

  constructor(...args: unknown[]) {
    // @ts-ignore
    super(...args);
    Object.keys(GUILD_CONFIGS).forEach((config) => {
      Object.defineProperty(this, config, {
        get() {
          return this.config?.[config] ?? DEFAULT_CONFIGS[config];
        },
      });
    });
  }

  get config() {
    return this.client.guildConfigs.get(this.id);
  }

  get logHook() {
    const { logs } = this;
    return logs ? new WebhookClient(logs.webhook.id, logs.webhook.token) : null;
  }

  iconURL() {
    return (
      super.iconURL() ||
      `https://via.placeholder.com/128/2f3136/808080%20?text=${this.nameAcronym}`
    );
  }

  setConfig<T>(key: GUILD_CONFIGS, value: T) {
    this.client.guildConfigs.set(
      this.id,
      Object.assign(this.config || {}, { [key]: value })
    );
  }

  sendLog(methods: Partial<EmbedMethods>) {
    if (!this.logs) return;
    const channel = this.channels.cache.get(
      this.logs.channel
    ) as HavocTextChannel;
    if (!channel) return;

    const embed = new MessageEmbed().setTimestamp();
    Object.entries(methods).forEach(([method, values]) =>
      // @ts-ignore
      embed[method](...Util.arrayify(values))
    );
    const toSend = {
      embeds: [embed],
      username: ',HavocLogs',
      avatarURL: HAVOC_LOGS_AVATAR(),
    };

    this.logHook?.send(toSend).catch(async (error: DiscordAPIError) => {
      if (error.code === 10015) {
        const webhook = await channel
          .createWebhook(',HavocLogs', {
            avatar: this.client.user!.displayAvatarURL(),
          })
          .catch(NOOP);
        if (!webhook) return delete this.config?.logs;

        this.logs!.webhook = {
          id: webhook.id,
          token: webhook.token!,
        };
        await (this.client as Havoc).db.upsert(GuildEntity, this.id, {
          logs: this.logs,
        });

        return webhook.send(toSend);
      }
      delete this.config?.logs;
    });
  }

  async sendModLog({
    message,
    target,
    reason,
    duration,
  }: {
    message: HavocMessage;
    target: GuildMember | User;
    reason?: string;
    duration?: number;
  }) {
    if (!this.modlogs) return;

    if (!(target instanceof User))
      target = await this.client.users.fetch(target.id);

    const channel = this.client.channels.cache.get(
      this.modlogs
    ) as HavocTextChannel;
    if (!channel) {
      delete this.modlogs;
      const guildEntity = await this.client.db.find(GuildEntity, this.id);

      if (guildEntity && guildEntity.modlogs) {
        delete guildEntity.modlogs;
        await this.client.db.flush();
      }
      return;
    }

    const fields = [
      { name: '❯Member', value: `${target.tag} (${target.id})` },
      {
        name: '❯Action',
        value: Util.captialise(
          message.command.name.replace('clearwarnings', 'Clear Warnings')
        ),
      },
    ];
    if (duration)
      fields.push({ name: '❯Duration', value: ms(duration, { long: true }) });
    if (reason) fields.push({ name: '❯Reason', value: reason });

    channel.send(
      new MessageEmbed()
        .setAuthor(
          `${message.author.tag} (${message.author.id})`,
          message.author.pfp
        )
        .addFields(fields)
        .setColor(MODLOGS_COLOUR[message.command.name])
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp()
    );
  }
}
