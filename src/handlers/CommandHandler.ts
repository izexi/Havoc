import Command from '../structures/bases/Command';
import Util from '../util';
import HavocMessage from '../structures/extensions/HavocMessage';
import Regex from '../util/regex';
import Handler from '../structures/bases/Handler';
import { promises as fs } from 'fs';
import { join } from 'path';
import EmojiCommand from '../structures/bases/EmojiCommand';
import { HAVOC } from '../util/CONSTANTS';

export default class extends Handler<Command> {
  async load() {
    const commandPaths = await Util.flattenPaths('commands');
    await Promise.all(commandPaths)
      .then(this.loadFromPaths)
      .catch(error =>
        this.client.logger.error(error, {
          origin: 'CommandHandler#loadFromPaths()'
        })
      );
    this.client.logger.info(`Loaded ${this.holds.size} commands`, {
      origin: 'CommandHandler#load()'
    });
  }

  loadFromPaths = async (commandPaths: string[]) => {
    this.holds = new Map(
      commandPaths.map(cmdPath => {
        const command: Command = new (require(cmdPath).default)();
        return [command.name.toLowerCase(), command];
      })
    );

    await fs
      .readdir(join(__dirname, '..', 'assets', 'images', 'emojis'))
      .then(emojiFiles =>
        emojiFiles.forEach(emojiFile => {
          const emojiName = emojiFile.split('.')[0].toLowerCase();
          this.holds.set(emojiName, new EmojiCommand(emojiName));
        })
      );
  };

  find(nameOrAlias: string) {
    return (
      this.holds.get(nameOrAlias) ||
      [...this.holds.values()].find(command => command.aliases.has(nameOrAlias))
    );
  }

  handle = async (message: HavocMessage) => {
    if (
      !message.client.initialised ||
      message.author?.bot ||
      message.webhookID ||
      !message.prefix ||
      !message.content.startsWith(message.prefix) ||
      // @ts-ignore
      message.channel.prompts?.has(message.author.id) ||
      this.client.blacklisted.users.has(message.author.id)
    )
      return;

    if (Regex.mentionPrefix(message.client.user!.id).test(message.arg!))
      message.args[0] = `${message.args.shift()} ${message.args[0]}`;

    if (message.guild) {
      const possibleTag = message.guild.tags.get(
        message.content.substring(message.prefix.length)
      );
      if (possibleTag)
        return message.channel.send(possibleTag, { disableMentions: 'all' });
    }

    const possibleCmd = message
      .arg!.substring(message.prefix.length)
      .toLowerCase();
    if (!possibleCmd) return;
    const command = this.find(possibleCmd);
    if (
      !command ||
      (command.category === 'dev' && message.author.id !== HAVOC) ||
      this.client.blacklisted.commands.has(command.name)
    )
      return;

    message.command = command;
    message.runCommand();
  };
}
