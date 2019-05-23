import { User, GuildMember, TextChannel } from 'discord.js';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default abstract class implements CommandOptions {
	public name: string;

	public category: string;

	public description: string;

	public aliases: Set<string>;

	public opts: number;

	public target: CommandOptions['target'];

	public prompt: CommandOptions['prompt'];

	public flags: Set<string>;

	public subCommands: Set<string>;

	public subArgs: CommandOptions['subArgs'];

	public constructor(__path: string, options: CommandOptions) {
		const path = __path.split('\\');
		this.name = path.pop()!.slice(0, -3);
		this.category = path.pop()!;
		this.description = options.description;
		this.aliases = options.aliases || new Set();
		this.opts = options.opts;
		this.target = options.target;
		this.prompt = options.prompt;
		this.flags = options.flags || new Set();
		this.subCommands = options.subCommands || new Set();
		this.subArgs = options.subArgs;
	}

	abstract run(this: HavocClient, params: CommandParams): void;
}

interface CommandOptions {
	aliases?: Set<string>;
	/*
	opts(x) -> {
		x & 1: deleteable
		x & 1 << 1: editable
		x & 1 << 2: target
		x & 1 << 3: args required
		x & 1 << 4: subCommand required
	}
	*/
	opts: number;
	description: string;
	target?: TargetType;
	prompt?: {
		initialMsg: string[];
		invalidResponseMsg?: string;
		validateFn?: Function | Function[];
	};
	flags?: Set<string>;
	subCommands?: Set<string>;
	subArgs?: {
		subCommand: string | string[];
		target: TargetType;
		prompt?: {
			initialMsg: string[];
			invalidResponseMsg?: string | string[];
			validateFn?: Function | Function[];
		};
	}[];
}


export interface CommandParams {
	msg: HavocMessage;
	target?: User | GuildMember | TextChannel | null;
}

export type TargetType = 'member' | 'user' | 'channel' | 'emoji' | 'string' | 'command' | 'role';
