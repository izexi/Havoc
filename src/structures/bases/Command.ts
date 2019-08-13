import { BitFieldResolvable, PermissionString } from 'discord.js';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default abstract class implements CommandOptions {
	public name: string;

	public category: string;

	public description: string;

	public aliases: Set<string>;

	public opts: number;

	public flags: Set<string>;

	public userPerms: CommandOptions['userPerms'];

	public args: CommandOptions['args'];

	public constructor(__path: string, options: CommandOptions) {
		// @ts-ignore
		const { groups: { name, category } } = __path.match(/[\\\/](?<category>[a-z]+)[\\\/](?<name>[_a-z\-\d]+)\.ts/);
		this.name = name;
		this.category = category;
		this.description = options.description;
		this.aliases = options.aliases || new Set();
		this.opts = options.opts;
		this.args = options.args;
		this.flags = options.flags || new Set();
		this.userPerms = options.userPerms;
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
	args?: {
		optional?: boolean;
		key?: string;
		type: TargetType;
		index?: number;
		prompt?: {
			initialMsg: string | Function;
			invalidResponseMsg?: string;
			validateFn?: Function;
		};
	}[];
	flags?: Set<string>;
	userPerms?: {
		role?: Function;
		flags?: BitFieldResolvable<PermissionString>;
	};
}


export interface CommandParams {
	msg: HavocMessage;
	target?: {
		[key: string]: any;
	};
	text?: string;
	flag?: string;
}

export type TargetType = 'member' | 'user' | 'channel' | 'emoji' | 'string' | 'command' | 'role' | 'number' | 'id' | 'time' | Function | 'tagName';
