import {
  Guild,
  WebhookClient,
  MessageEmbed,
  DiscordAPIError
} from 'discord.js';
import { EmbedMethods } from './HavocMessage';
import Util from '../../util';
import HavocTextChannel from './HavocTextChannel';
import GuildEntity from '../entities/GuildEntity';
import Havoc from '../../client/Havoc';

export default class extends Guild {
  prefix = process.env.PREFIX!;

  tags = new Map();

  bcPrefixes = ['!', '.', '?'];

  logs?: {
    disabled: number[];
    channel: string;
    webhook: {
      id: string;
      token: string;
    };
  };

  autorole?: string;

  welcomer?: string;

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
      avatarURL: Math.round(Math.random())
        ? 'https://cdn.discordapp.com/emojis/444944971653709825.png?v=1'
        : 'https://i.imgur.com/l3H2S2d.png'
    };

    this.logHook?.send(toSend).catch(async (error: DiscordAPIError) => {
      if (error.code === 10015) {
        const webhook = await channel
          .createWebhook(',HavocLogs', {
            avatar: this.client.user!.displayAvatarURL()
          })
          .catch(() => null);
        if (!webhook) return delete this.logs;

        this.logs!.webhook = {
          id: webhook.id,
          token: webhook.token!
        };
        await (this.client as Havoc).db.upsert(GuildEntity, this.id, {
          logs: this.logs
        });

        return webhook.send(toSend);
      }
      delete this.logs;
    });
  }
}
