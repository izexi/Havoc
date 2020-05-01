import Regex from '../../util/regex';
import {
  Message,
  MessageEmbed,
  TextChannel,
  MessageOptions,
  MessageAttachment,
  StringResolvable,
  MessageEditOptions,
  FileOptions,
  EmojiResolvable,
  APIMessage
} from 'discord.js';
import HavocGuild from './HavocGuild';
import Havoc from '../../client/Havoc';
import Command from '../bases/Command';
import HavocUser from './HavocUser';
import Util, { MaybeArray } from '../../util';
import {
  TargetType,
  Targets,
  resolveTarget,
  Target,
  NotFound,
  isOther,
  NotOther,
  resolveTargetKey
} from '../../util/targetter';
import Prompt from '../Prompt';
import EmbedPagination, { EmbedPaginationOptions } from '../EmbedPagination';
import { Responses } from '../../util/responses';
import GuildEntity from '../entities/GuildEntity';
import HavocTextChannel from './HavocTextChannel';
import { stripIndents } from 'common-tags';
import HavocGuildMember from './HavocGuildMember';
import { NOOP } from '../../util/CONSTANTS';

export interface EmbedMethods {
  addField: [string, string];
  addFields: { name: string; value: string; inline?: boolean }[];
  attachFiles: (string | FileOptions)[];
  setAuthor: string | string[];
  setColor: string;
  setDescription: string;
  setFooter: string | [string, string];
  setImage: string;
  setThumbnail: string;
  setTitle: string;
  setURL: string;
  [key: string]: EmbedMethods[keyof EmbedMethods];
}

export default class HavocMessage extends Message {
  author!: HavocUser;

  client!: Havoc;

  guild!: HavocGuild | null;

  member!: HavocGuildMember;

  edits!: this[];

  command!: Command;

  args = this.content.split(/ +/);

  response?: this;

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

  safeReact(emoji: EmojiResolvable) {
    return this.deleted ? null : this.react(emoji).catch(NOOP);
  }

  async delete(options?: { timeout?: number; reason?: string }) {
    return this.deleted ? this : super.delete(options);
  }

  async edit(
    contentOrOptions:
      | StringResolvable
      | MessageEditOptions
      | MessageEmbed
      | APIMessage,
    options?: MessageEditOptions | MessageEmbed
  ) {
    return this.deleted
      ? this
      : options
      ? ((super.edit(contentOrOptions, options) as unknown) as this)
      : ((super.edit(contentOrOptions) as unknown) as this);
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
    await this.safeReact('464034357955395585');
    const { fn: response } = await this.createPrompt({
      initialMsg: `**${this.author.tag}** are you sure you want to ${action}?  Enter __y__es or __n__o`,
      invalidMsg: 'Enter __y__es or __n__o',
      target: msg => msg.arg?.match(/^(yes|y|n|no)$/i)?.[0]
    });

    if (response?.charAt(0).toLowerCase() === 'y') {
      if (!this.deleted) await this.reactions.removeAll();
      await this.safeReact('464033586748719104');
      return true;
    }

    if (!this.deleted) {
      await this.reactions.removeAll();
      await this.safeReact('464034188652183562');
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
      const { response } = Util.lastArrEl(this.edits) ?? {};
      if (response) {
        if (
          typeof content === 'string' &&
          !(options instanceof MessageEmbed) &&
          response.embeds.length
        )
          return response.edit(content, { embed: null });

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

    if (embed.description) embed.description = stripIndents(embed.description);
    if (
      methods.setFooter === undefined &&
      !embed.footer?.text &&
      !embed.description?.includes(this.author.tag) &&
      this.author.id !== this.client.user?.id
    )
      embed.setFooter(`Requested by ${this.author.tag}`, this.author.pfp);
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
    )
      return (this.response = await this.send(
        `**${this.author}** I require the \`Embed Links\` permission to execute this command.`
      ));

    const embed = await this.send({
      content,
      files,
      embed:
        methodsOrEmbed instanceof MessageEmbed
          ? methodsOrEmbed
          : this.constructEmbed(methodsOrEmbed)
    });

    if (this.command && embed) {
      await embed.safeReact('🗑')?.catch(NOOP);
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
          this.guild
            ? (this.channel as TextChannel).bulkDelete([embed, this])
            : embed.delete()
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
            }${toSend}${toSend.endsWith('.') ? '' : '.'}`
          }
        : toSend
    );
  }

  async findConfigChannel(config: 'suggestion' | 'giveaway') {
    const guild = this.guild!;
    const existing = guild.channels.cache.find(
      channel => channel.name === `${config}s`
    );
    const guildEntity = await this.client.db.find(GuildEntity, guild.id);
    const setupResponse = `${
      this.member!.permissions.has('MANAGE_GUILD')
        ? 'U'
        : 'You will need to ask someone with the `Manage Guild` permission to u'
    }se \`${this.prefix}${config} config\` to set one up.`;

    // @ts-ignore
    if (!guildEntity || !guildEntity[config]) {
      if (!existing) {
        this.respond({
          setDescription: `**${this.author.tag}** I couldn't find a \`#${config}s\` and a ${config} channel hasn't been configured. ${setupResponse}`
        });
        return null;
      }
      return existing as HavocTextChannel;
    }

    // @ts-ignore
    const channel = guild.channels.cache.get(guildEntity[config]);
    if (!channel) {
      this.respond({
        setDescription: `**${this.author.tag}** the ${config} channel that was in the configuration doesn't exist. ${setupResponse}.`
      });
      // @ts-ignore
      delete guildEntity[config];
      await this.client.db.flush();
      return null;
    }
    return channel as HavocTextChannel;
  }

  async runCommand() {
    const params: {
      [key: string]: Targets[keyof Targets];
    } = {};
    const { command } = this;

    if (!command.sub) this.args.shift();

    if (!command.dm && this.channel.type === 'dm')
      return this.respond('this command cannot be used in DMs');

    if (command.requiredPerms) {
      const flags = Util.arrayify(command.requiredPerms);
      if (!this.member!.hasPermission(flags)) {
        await this.safeReact('⛔');
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
              (isOther(type) ? '' : Responses[type as NotOther]!(this))}
              Enter \`cancel\` to exit out of this prompt.`;

          found = await this.createPrompt({
            initialMsg,
            invalidMsg: promptOpts?.invalid || '',
            target: type
          }).then(responses => Object.assign(params, responses));
          if (
            (required && found![resolveTargetKey(type)] == null) ||
            Object.values(found!).every(f => f == null)
          )
            return;
        }
      }
    }

    command.run
      .call(this.client, { message: this, ...params })
      .then(() => {
        this.client.logger.info(
          `${this.author.tag} (${this.author.id}) used command ${this.prefix}${
            command.name
          } in ${this.guild ? `${this.guild.name} (${this.guild.id})` : 'DM'} ${
            this.channel.type === 'text'
              ? `on #${this.channel.name} (${this.guild!.id})`
              : ''
          }`,
          { origin: 'HavocMessage#runCommand()' }
        );

        this.client.prometheus.commandCounter.inc({
          command_name: command.name
        });
      })
      .catch(async rej => {
        this.client.logger.warn(rej, {
          origin: `${Util.captialise(command.name)}#run()`
        });

        this.channel.send(
          new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('Something may have gone wrong?')
            .setDescription(stripIndents`
              Check \`${this.prefix}help ${
            command.name
          }\` to check how to properly use the command
              However, if you have used the command correctly please join **https://discord.gg/3Fewsxq** and report your issue in the ${await this.client.guilds.cache
                .get('406873117215031297')
                ?.members.fetch(this.author.id)
                .then(
                  () => '<#406873476591517706>',
                  () => '#bugs-issues'
                )} channel.
            `)
        );

        (this.client.channels.cache.get(
          '612603429591973928'
        ) as HavocTextChannel).send(
          new MessageEmbed()
            .setDescription(
              `**Server:** ${
                this.guild ? `${this.guild.name} (${this.guild.id})` : 'DM'
              }
              **Unhandled Rejection:** ${Util.codeblock(rej.stack || rej)}
              **User:** ${this.author.tag} (${this.author.id})
              **Command:** ${command.name}
              **Message Content:**
              ${Util.codeblock(this.content)}
              **Params:**
              ${Util.codeblock(JSON.stringify(params, null, 2))}`
            )
            .setColor('ORANGE')
            .setAuthor(`⚠${rej}⚠`, this.guild ? this.guild.iconURL() : '')
            .setTimestamp()
            .setFooter('', this.author.pfp)
        );
      });
  }
}
