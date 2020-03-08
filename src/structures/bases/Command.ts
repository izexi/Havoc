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

	public examples: CommandOptions['examples'];

	public usage: CommandOptions['usage'];

	public deleteable!: boolean;

	public editable!: boolean;

	public targetable!: boolean;

	public argsRequired!: boolean;

	public constructor(__path: string, options: CommandOptions) {
		const match = __path.match(/[\\\/](?<category>[a-z]+)[\\\/](?<name>[_a-z\-\d]+)\.[tj]s/i);
		if (!match) console.log(__path, 'matched: ', __path.match(/[\\\/](?<category>[a-z]+)[\\\/](?<name>[_a-z\-\d]+)\.[tj]s/i));
		// @ts-ignore
		const { groups: { name, category } } = match;
		this.name = name;
		this.category = category;
		this.description = options.description;
		this.aliases = options.aliases || new Set();
		this.opts = options.opts;
		this.args = options.args;
		this.flags = options.flags || new Set();
		this.examples = options.examples || {};
		this.usage = options.usage;
		this.userPerms = options.userPerms;
		this.assignGetters();
	}

	public assignGetters() {
		const opts = ['deleteable', 'editable', 'targetable', 'argsRequired'];
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		opts.forEach((o, i) =>
			Object.defineProperty(this, o, { get: () => this.opts & (1 << i) }));
	}

	abstract async run(this: HavocClient, params: CommandParams): Promise<any>;
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
	/**
	**	x & 1: deleteable
	**	x & 1 << 1: editable
	**	x & 1 << 2: target
	**	x & 1 << 3: args required
	**	x & 1 << 4: subCommand required
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
		usage?: string;
	}[];
	examples?: { [key: string]: string };
	usage?: string[];
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

export type TargetType = 'member' | 'user' | 'channel' | 'emoji' | 'string' | 'command' | 'role' | 'number' | 'id' | 'time' | Function | 'tagName' | 'question' | 'options';
