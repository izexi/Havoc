import { Client, ClientOptions, Guild } from 'discord.js';
import Logger from '../util/Logger';
import CommandStore from '../stores/CommandStore';
import EventStore from '../stores/EventStore';
import Database from '../structures/Database';
import GiveawayStore from '../stores/GiveawayStore';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { token } = require('../../config.json');

export default class HavocClient extends Client {
	public havoc = '191615925336670208';

	public db = new Database();

	public supportServer!: Guild;

	public commands = new CommandStore(this);

	public events = new EventStore(this);

	public giveaways = new GiveawayStore(this);

	public pollScheduler!: NodeJS.Timer;

	public giveawayScheduler!: Promise<void>;

	public giveawaySchedule = true;

	public constructor(options: ClientOptions = {}) {
		super(options);
		this._init();
	}

	private _init() {
		this.login(token)
			.then(() => Logger.status(`Logged in as ${this.user!.tag}`))
			.catch(err => Logger.error('Error while logging in', err));
	}
}
