import { Collection } from 'discord.js';
import { promisify } from 'util';
import Logger from '../util/Logger';
import Command from '../structures/Command';
const readdir = promisify(require('fs').readdir);

export default class CommandStore extends Collection<string, Command> {
	public constructor() {
		super();
		this._loadCommands();
	}

	private async _loadCommands(): Promise<void> {
		const commandFiles = (await readdir('src/commands')).reduce(async (files: Set<string>, dirs: string) => {
			files = await files;
			(await readdir(`src/commands/${dirs}`))
				.map((fileName: string): Set<string> => files.add(`../commands/${dirs}/${fileName.slice(0, -3)}`));
			return files;
		}, Promise.resolve(new Set()));

		for (const commandFile of await commandFiles) {
			try {
				const command = new (require(commandFile).default)();
				this.set(command.name, command);
			} catch (err) {
				Logger.error(`Error while importing file - ${commandFile}`, err);
			}
		}
	}

	public get(possibleCommand: string): Command | undefined {
		possibleCommand = possibleCommand.toLowerCase();
		return super.get(possibleCommand) ||
			super.find((c: Command) => c.aliases && c.aliases.has(possibleCommand));
	}
}
