import Handler from '../structures/bases/Handler';
import CommandStore from '../stores/CommandStore';
import { Client } from 'discord.js';
import Command from '../structures/bases/Command';

export default class CommandHandler extends Handler<string, Command> {
	private _client: any;

	private _commands: CommandStore;

	public constructor(client: Client, events: CommandStore) {
		super();
		this._client = client;
		this._commands = events;
	}

	public add(name: string, command: Command) {
		this._commands.set(name.replace('_', ''), command);
	}

	public reload(name: string | Command) {
		let command = name instanceof Command ? name : this.get(name);
		if (command) {
			const path = `../commands/${command.category}/${command.name}`;
			delete require.cache[require.resolve(path)];
			command = new (require(path).default)();
			this.add(command!.name, command!);
		}
	}

	public has(name: string) {
		if (!name) return false;
		name = name.toLowerCase();
		return this._commands.has(name) ||
			this._commands.some((c: Command) => c.aliases && c.aliases.has(name));
	}

	public get(name: string): Command | undefined {
		if (!name) return undefined;
		name = name.toLowerCase();
		return this._commands.get(name) ||
			this._commands.find((c: Command) => c.aliases && c.aliases.has(name));
	}

	public remove(event: string) {
		this._client.removeAllListeners(event);
	}
}
