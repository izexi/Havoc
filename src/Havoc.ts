import { Client, ClientOptions } from 'discord.js';
import Logger from './util/Logger';
import CommandStore from './stores/CommandStore';
import EventStore from './stores/EventStore';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token } = require('../config.json');

export default class HavocClient extends Client {
	public havoc = '191615925336670208';

	public commands = new CommandStore(this);

	public events = new EventStore(this);

	public constructor(options: ClientOptions = {}) {
		super(options);
		this._init();
	}

	private _init(): void {
		this.login(token)
			.then((): void => Logger.status(`Logged in as ${this.user!.tag}`))
			.catch((err): void => Logger.error('Error while logging in', err));
	}
}
