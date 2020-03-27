import Logger from '../util/Logger';
import Command from '../structures/bases/Command';
import Util from '../util/Util';
import HavocMessage from '../structures/extensions/HavocMessage';
import { Targetter, Targets } from '../util/Targetter';

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
    const possibleCmd = message.args[0]
      .substring(message.prefix.length)
      .toLowerCase();
    if (!possibleCmd) return;
    const command =
      this.commands.get(possibleCmd) ||
      [...this.commands.values()].find(command =>
        command.aliases.has(possibleCmd)
      );
    if (!command) return;
    message.command = command;
    message.args.shift();
    const params: {
      message: HavocMessage;
      [key: string]: HavocMessage | Targets[keyof Targets];
    } = { message };
    if (command.args) {
      for (const { type, required, prompt, promptOpts } of command.args) {
        let found = await Targetter[type]!.get(message, message.args[0]);
        if (!found && required) {
          const responses = await message.createPrompt({
            initialMsg: promptOpts?.initial || prompt!,
            invalidMsg: promptOpts?.invalid || '',
            target: type
          });
          found = responses[type];
        }
        params[type] = found!;
      }
    }
    command.run.call(message.client, params);
  };
}
