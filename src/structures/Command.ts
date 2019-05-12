import { Message } from 'discord.js';

export default abstract class implements CommandOptions {
	public name: string;

	public category: string;

	public aliases: Set<string>;

	public constructor(__path: string, options: CommandOptions) {
		const path = __path.split('\\');
		this.name = path.pop()!.slice(0, -3);
		this.category = path.pop()!;
		this.aliases = options.aliases;
	}

	abstract run(msg: Message): void;
}

interface CommandOptions {
	aliases: Set<string>;
}
