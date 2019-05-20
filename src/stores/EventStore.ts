import { Client } from 'discord.js';
import { promisify } from 'util';
import EventHandler from '../handlers/EventHandler';
const readdir = promisify(require('fs').readdir);

export default class EventStore extends Map<string, Function> {
	private _client: Client;

	public handler!: EventHandler;

	public constructor(client: Client) {
		super();
		this._client = client;
		this._loadEvents();
	}

	private async _loadEvents() {
		(await readdir('src/events'))
			.forEach((event: string) => {
				event = event.slice(0, -3);
				this.set(event, require(`../events/${event}`).default.bind(this._client));
			});
		this._setListeners();
	}

	private _setListeners() {
		this.handler = new EventHandler(this._client, this);
		this.handler.setListeners();
	}
}
