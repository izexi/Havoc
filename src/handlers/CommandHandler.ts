import Logger from '../util/Logger';
import Command from '../structures/bases/Command';
import Util from '../util/Util';
import HavocMessage from '../structures/extensions/HavocMessage';
import { Targets, resolveTarget } from '../util/Targetter';
import { Responses } from '../util/Responses';

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

    const possibleCmd = message.arg
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

    if (command.args.length) {
      for (const { type, required, prompt, promptOpts } of command.args) {
        let found;

        if (message.args.length && !command.promptOnly)
          found = await resolveTarget(params, type, message, message.text);

        if (!found && (command.promptOnly || required)) {
          let initialMsg = promptOpts?.initial || prompt!;

          if (
            message.args.length &&
            !command.promptOnly &&
            typeof type !== 'function'
          )
            initialMsg = `\`${
              message.text
            }\` is an invalid option!${promptOpts?.invalid ||
              Responses[type]!(message)}
              Enter \`cancel\` to exit out of this prompt.`;

          found = await message
            .createPrompt({
              initialMsg,
              invalidMsg: promptOpts?.invalid || '',
              target: type
            })
            .then(responses => Object.assign(params, responses));
          if (!found) return;
        }
      }
    }
    command.run.call(message.client, params);
  };
}
