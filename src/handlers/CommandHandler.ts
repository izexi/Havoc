import Logger from '../util/Logger';
import Command from '../structures/bases/Command';
import Util from '../util/Util';
import HavocMessage from '../structures/extensions/HavocMessage';
import { Targetter } from '../util/Targetter';

export default class {
  commands: Map<Command['name'], Command> = new Map();

  constructor() {
    this.load();
  }

  async load() {
    const commandPaths = await Util.flattenPaths('commands');
    await Promise.all(commandPaths)
      .then(this.loadFromPaths)
      .catch(error => Logger.error('CommandHandler#load()', error));
    Logger.status(`Loaded ${this.commands.size} commands`);
  }

  loadFromPaths = (commandPaths: string[]) => {
    this.commands = new Map(
      commandPaths.map(cmdPath => {
        const command: Command = new (require(cmdPath).default)();
        return [command.name.toLowerCase(), command];
      })
    );
  };

  handle = async (message: HavocMessage) => {
    if (
      message.author?.bot ||
      message.webhookID ||
      !message.prefix ||
      !message.content.startsWith(message.prefix)
    )
      return;
    const possibleCmd = message.args
      .shift()
      ?.substring(message.prefix.length)
      ?.toLowerCase();
    if (!possibleCmd) return;
    const command =
      this.commands.get(possibleCmd) ||
      [...this.commands.values()].find(command =>
        command.aliases.has(possibleCmd)
      );
    if (!command) return;
    const params = { message };
    message.command = command;
    if (command.args) {
      await Targetter.parse(message)
        .then(parsed => Object.assign(params, parsed))
        .catch(error => Logger.error('Targetter#parse()', error));
    }
    command.run.call(message.client, params);
  };
}
