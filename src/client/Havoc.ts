import { Client, ClientOptions, Guild } from 'discord.js';
import Logger from '../util/Logger';
import CommandStore from '../stores/CommandStore';
import EventStore from '../stores/EventStore';
import Database from '../structures/Database';
import SchedulerStore from '../stores/SchedulerStore';
import { onceReady } from '../events/ready';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token } = require('../../config.json');

export default class HavocClient extends Client {
	public havoc = '191615925336670208';

	public donators: Map<string, Set<string>> = new Map([
		['1', new Set()],
		['5', new Set()],
		['10', new Set()]
	]);

	public db = new Database();

	public supportServer!: Guild;

	public commands = new CommandStore(this);

	public events = new EventStore(this);

	public scheduler = new SchedulerStore(this);

	public constructor(options: ClientOptions = {}) {
		super(options);
		this._init();
	}

	private _init() {
		this.commands.load();
		this.events.load();
		this.once('ready', onceReady.bind(this));
		this.login(token)
			.then(() => Logger.status(`Logged in as ${this.user!.tag}`))
			.catch(err => Logger.error('Error while logging in', err));
	}
}
