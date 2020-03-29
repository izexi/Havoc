import Regex from '../../util/Regex';
import {
  Message,
  MessageEmbed,
  TextChannel,
  MessageOptions,
  MessageAttachment,
  StringResolvable,
  MessageEditOptions
} from 'discord.js';
import HavocGuild from './HavocGuild';
import Havoc from '../../client/Havoc';
import Command from '../bases/Command';
import HavocUser from './HavocUser';
import Util, { MaybeArray } from '../../util/Util';
import { TargetType } from '../../util/Targetter';
import Prompt from '../Prompt';
import EmbedPagination, { EmbedPaginationOptions } from '../EmbedPagination';

export interface EmbedMethods {
  addField: [string, string];
  addFields: { name: string; value: string; inline?: boolean }[];
  attachFiles: string;
  setAuthor: [string, string];
  setColor: string;
  setDescription: string;
  setFooter: string;
  setImage: string;
  setThumbnail: string;
  setTitle: string;
  setURL: string;
  [key: string]: EmbedMethods[keyof EmbedMethods];
}

export default class extends Message {
  author!: HavocUser;

  client!: Havoc;

  guild!: HavocGuild | null;

  edits!: this[];

  edit!: (
    content?: StringResolvable,
    options?: MessageEditOptions | MessageEmbed
  ) => Promise<this>;

  command!: Command;

  args = this.content.split(/ +/);

  response?: this;

  public _patch(data: object) {
    // @ts-ignore
    super._patch(data);
  }

  get text() {
    return this.args.join(' ');
  }

  get arg() {
    return this.args[0];
  }

  get prefix() {
    if (!this.guild) return process.env.PREFIX;
    const [matchedPrefix] =
      this.content.match(
        Regex.prefix(this.client.user!.id, this.guild.prefix)
      ) ?? [];
    return matchedPrefix;
  }

  async createPrompt(options: {
    initialMsg: MaybeArray<string>;
    invalidMsg?: MaybeArray<string>;
    target: MaybeArray<TargetType>;
    time?: number;
  }) {
    return new Prompt({ message: this, ...options }).create();
  }

  async paginate(options: Omit<EmbedPaginationOptions, 'message'>) {
    new EmbedPagination({ message: this, ...options });
  }

  async send(
    content: string | MessageOptions,
    options?:
      | MessageOptions
      | MessageEmbed
      | MessageAttachment
      | (MessageEmbed | MessageAttachment)[]
  ) {
    if (this.edits.length > 1) {
      const { response } = this.edits[this.edits.length - 1] ?? {};
      if (response) {
        if (
          typeof content === 'string' &&
          !(options instanceof MessageEmbed) &&
          response.embeds.length
        ) {
          return response.edit(content, { embed: null });
        }
        return options instanceof MessageEmbed
          ? response.edit(content, options)
          : response.edit(content);
      }
    }
    return this.channel
      .send(content, options)
      .then(msg => (this.response = msg as this));
  }

  constructEmbed(methods: Partial<EmbedMethods>) {
    const embed = new MessageEmbed()
      .setColor(this.guild ? this.member!.displayColor || 'WHITE' : '')
      .setTimestamp();
    Object.entries(methods).forEach(([method, values]) =>
      // @ts-ignore
      embed[method](...Util.arrayify(values))
    );
    if (
      !methods.setFooter &&
      !embed.footer?.text &&
      !embed.description?.includes(this.author.tag) &&
      this.author.id !== this.client.user?.id
    ) {
      embed.setFooter(`Requested by ${this.author.tag}`, this.author.pfp);
    }
    return embed;
  }

  async sendEmbed(
    methodsOrEmbed: Partial<EmbedMethods> | MessageEmbed,
    content?: string,
    files?: { attachment: Buffer; name?: string }[]
  ) {
    if (
      this.guild &&
      !(this.channel as TextChannel)
        .permissionsFor(this.guild.me!)!
        .has('EMBED_LINKS')
    ) {
      return (this.response = await this.send(
        `**${this.author}** I require the \`Embed Links\` permission to execute this command.`
      ));
    }
    const embed = await this.send({
      content,
      files,
      embed:
        methodsOrEmbed instanceof MessageEmbed
          ? methodsOrEmbed
          : this.constructEmbed(methodsOrEmbed)
    });
    if (this.command) {
      await embed.react('🗑');
      embed
        .awaitReactions(
          (reaction, user) =>
            reaction.emoji.name === '🗑' && user.id === this.author.id,
          {
            time: 3000,
            max: 1,
            errors: ['time']
          }
        )
        .then(async () =>
          this.guild ? this.channel.bulkDelete([embed, this]) : embed.delete()
        )
        .catch(() => {
          if (!embed.deleted)
            embed.reactions.cache.get('🗑')?.users.remove(embed.author);
        });
    }
    return embed;
  }

  async respond(
    toSend: string | Partial<EmbedMethods>,
    author = true,
    contentOnly = false
  ) {
    if (contentOnly && typeof toSend === 'string') return this.send(toSend);
    return this.sendEmbed(
      typeof toSend === 'string'
        ? {
            setDescription: `${
              author ? `**${this.author.tag}** ` : ''
            }${toSend}`
          }
        : toSend
    );
  }
}
