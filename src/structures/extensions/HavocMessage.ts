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
import {
  TargetType,
  Targets,
  resolveTarget,
  Target,
  NotFound
} from '../../util/Targetter';
import Prompt from '../Prompt';
import EmbedPagination, { EmbedPaginationOptions } from '../EmbedPagination';
import { Responses } from '../../util/Responses';

export interface EmbedMethods {
  addField: [string, string];
  addFields: { name: string; value: string; inline?: boolean }[];
  attachFiles: string;
  setAuthor: string | [string, string];
  setColor: string;
  setDescription: string;
  setFooter: string | [string, string];
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

  _patch(data: object) {
    // @ts-ignore
    super._patch(data);
  }

  get text() {
    return this.args.join(' ');
  }

  get arg(): string | undefined {
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

  shiftArg<T>(arg: T) {
    if (arg) this.args.shift();
    return arg;
  }

  async createPrompt(options: {
    initialMsg: MaybeArray<string>;
    invalidMsg?: MaybeArray<string>;
    target: MaybeArray<TargetType>;
    time?: number;
  }) {
    return new Prompt({ message: this, ...options }).create();
  }

  async confirmation(action: string) {
    await this.react('464034357955395585');
    const { fn: response } = await this.createPrompt({
      initialMsg: `**${this.author.tag}** are you sure you want to ${action}?  Enter __y__es or __n__o`,
      invalidMsg: 'Enter __y__es or __n__o',
      target: msg => msg.arg?.match(/^(yes|y|n|no)$/i)
    });
    if (response.charAt(0).toLowerCase() === 'y') {
      if (!this.deleted) await this.reactions.removeAll();
      await this.react('464033586748719104');
      return true;
    }
    if (!this.deleted) {
      await this.reactions.removeAll();
      await this.react('464034188652183562');
    }
    await this.respond(
      `the \`${this.command.name}\` command has been cancelled.`
    );
    return false;
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
    if (embed.description) {
      const [image] =
        embed.description.match(/\bhttps:\/\/i\.imgur\.com\/[^\s]+/) || [];
      if (image) {
        embed.setDescription(embed.description.replace(image, ''));
        embed.setImage(image);
      }
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

  async runCommand() {
    const params: {
      [key: string]: Targets[keyof Targets];
    } = {};
    const { command } = this;

    this.args.shift();

    if (command.requiredPerms) {
      const flags = Util.arrayify(command.requiredPerms);
      if (!this.member!.hasPermission(flags)) {
        await this.react('⛔');
        return this.respond(
          `you need to have the ${flags
            .map(flag => `\`${Util.normalizePermFlag(flag)}\``)
            .join(', ')} ${Util.plural(
            'permission',
            flags.length
          )} in order to use this command.`
        );
      }
      if (!this.guild!.me!.hasPermission(flags)) {
        return this.respond(
          `I do not have sufficient permisions to use this command I need to have the ${flags
            .map(flag => `\`${Util.normalizePermFlag(flag)}\``)
            .join(', ')} ${Util.plural(
            'permission',
            flags.length
          )} in order to use this command.`
        );
      }
    }

    if (command.flags.length) {
      params.flags = command.flags.reduce(
        (flags: { [flag: string]: string }, possibleFlag) => {
          const flagIndex = this.args.findIndex(arg =>
            new RegExp(`${this.prefix}${possibleFlag}(=.+)?$`).test(arg)
          );
          if (flagIndex === -1) return flags;
          const [flag, value] = this.args[flagIndex]
            .substring(this.prefix!.length)
            .split('=');
          this.args.splice(flagIndex, 1);
          flags[flag] = value;
          return flags;
        },
        {}
      );
    }

    if (command.args.length) {
      for (const { type, required, prompt, promptOpts } of command.args) {
        let found: { [target in Target]?: Targets[target] } | NotFound;

        if (this.args.length && !this.command.promptOnly)
          found = await resolveTarget(params, type, this, this.text);

        if (found == null && (command.promptOnly || required)) {
          let initialMsg =
            promptOpts?.initial ||
            (typeof prompt === 'function'
              ? prompt.call(this.client, this)
              : prompt!);

          if (this.args.length && !command.promptOnly)
            initialMsg = `\`${
              this.text
            }\` is an invalid option! ${promptOpts?.invalid ||
              (typeof type === 'function' ? '' : Responses[type]!(this))}
              Enter \`cancel\` to exit out of this prompt.`;

          found = await this.createPrompt({
            initialMsg,
            invalidMsg: promptOpts?.invalid || '',
            target: type
          }).then(responses => Object.assign(params, responses));
          if (
            (required &&
              found![typeof type === 'function' ? Target.FUNCTION : type] ==
                null) ||
            Object.values(found!).every(f => f == null)
          )
            return;
        }
      }
    }

    command.run.call(this.client, { message: this, ...params });
  }
}
