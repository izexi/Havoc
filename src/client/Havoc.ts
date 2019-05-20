/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, ClientOptions, Guild } from 'discord.js';
import Logger from '../util/Logger';
import CommandStore from '../stores/CommandStore';
import EventStore from '../stores/EventStore';
import Database from '../structures/Database';
import HavocTextChannel from '../extensions/TextChannel';
import HavocMessage from '../extensions/Message';
const { parse } = require('json-buffer');
const { token } = require('../../config.json');

export default class HavocClient extends Client {
	public havoc = '191615925336670208';

	public supportServer!: Guild;

	public commands = new CommandStore(this);

	public events = new EventStore(this);

	public db = new Database();

	public constructor(options: ClientOptions = {}) {
		super(options);
		this._init();
	}

	private _init() {
		this.login(token)
			.then(() => Logger.status(`Logged in as ${this.user!.tag}`))
			.catch(err => Logger.error('Error while logging in', err));
		this.setInterval(() => {
			this.db.category = 'poll';
			this.db.lessThan(Date.now())
				.then(res => {
					if (!res) return;
					const { key, value } = res;
					const { channel, message, options } = parse(value);
					// eslint-disable-next-line promise/no-nesting
					(this.channels.get(channel)! as HavocTextChannel).messages.fetch(message)
						.then(async msg => (msg as HavocMessage).endPoll(options))
						.catch(() => null);
					this.db.delete(key.slice(5));
				})
				.catch(error => Logger.error('Database error:', error));
		}, 5000);
	}
}
