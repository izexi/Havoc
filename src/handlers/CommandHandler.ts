import Logger from '../util/Logger';
import Command from '../structures/bases/Command';
import Util from '../util/Util';
import HavocMessage from '../structures/extensions/HavocMessage';

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

  handle(message: HavocMessage) {
    if (
      message.author?.bot ||
      message.webhookID ||
      !message.prefix ||
      !message.content.startsWith(message.prefix)
    )
      return;
    const command = this.commands.get(
      message.args
        .shift()
        ?.substring(message.prefix.length)
        ?.toLowerCase() ?? ''
    );
    if (!command) return;
    command.run.call(message.client, { message });
  }
}
