import { Client } from 'discord.js';
import { promisify } from 'util';
import EventHandler from '../handlers/EventHandler';
const readdir = promisify(require('fs').readdir);

export default class EventStore extends Map<string, Function> {
	private _client: Client;

	public constructor(client: Client) {
		super();
		this._client = client;
		this._loadEvents();
	}

	private async _loadEvents(): Promise<void> {
		(await readdir('src/events'))
			.forEach((event: string) => {
				event = event.slice(0, -3);
				this.set(event, require(`../events/${event}`).default.bind(this._client));
			});
		this._setListeners();
	}

	private _setListeners() {
		const handler = new EventHandler(this._client, this);
		handler.setListeners();
	}
}
