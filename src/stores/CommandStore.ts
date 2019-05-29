import { promisify } from 'util';
import Store from '../structures/bases/Store';
import Logger from '../util/Logger';
import Command from '../structures/bases/Command';
import CommandHandler from '../handlers/CommandHandler';
import { Client } from 'discord.js';
const readdir = promisify(require('fs').readdir);

export default class CommandStore extends Store<string, Command> {
	private _client: Client;

	public handler: CommandHandler;

	public constructor(client: Client) {
		super();
		this._client = client;
		this.handler = new CommandHandler(this._client, this);
	}

	protected async _load(): Promise<void> {
		const commandFiles = (await readdir('src/commands')).reduce(async (files: Set<string>, dirs: string) => {
			files = await files;
			(await readdir(`src/commands/${dirs}`))
				.map((fileName: string): Set<string> => files.add(`../commands/${dirs}/${fileName.slice(0, -3)}`));
			return files;
		}, Promise.resolve(new Set()));

		for (const commandFile of await commandFiles) {
			try {
				const command = new (require(commandFile).default)();
				this.handler.add(command.name, command);
			} catch (err) {
				Logger.error(`Error while importing file - ${commandFile}`, err);
			}
		}
		Logger.info(`Loaded ${this.size} commands.`);
	}
}
