import { Message } from 'discord.js';
import Regex from '../util/Regex';
import HavocGuild from './Guild';
import Command from '../structures/bases/Command';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require('../../config.json');

export default class HavocMessage extends Message {
	public guild!: HavocGuild;

	public command!: Command

	public mentionPrefix!: boolean;

	public args!: string[];

	public text!: string;

	public prefix = prefix;

	public _patch(data: object) {
		super._patch(data);
		this._init();
	}

	private _init() {
		this.prefix = this.guild ? this._parsedPrefix : prefix;
		this.mentionPrefix = Regex.mentionPrefix(this.client.user!.id).test(this.prefix);
		this.args = this.content.substring(this.prefix.length).split(/ +/);
		this.text = this.args.slice(1).join(' ');
	}

	private get _parsedPrefix() {
		const [matchedPrefix]: RegExpMatchArray = this.content.match(Regex.prefix(this.client.user!.id, this.guild!.prefix)) || [];
		return matchedPrefix || '';
	}
}

declare module 'discord.js' {
	interface Message {
		_patch(data: object): void;
	}
}
