import EventStore from '../stores/EventStore';
import Handler from '../structures/Handler';
import { Client } from 'discord.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class EventHandler extends Handler<string, Function> {
	private _client: any;

	private _events: EventStore;

	public constructor(client: Client, events: EventStore) {
		super();
		this._client = client;
		this._events = events;
	}

	public setListeners() {
		for (const [event, fn] of this._events) {
			this.add(event, fn);
		}
	}

	public add(event: string, fn: Function) {
		this._client.on(event, fn);
	}

	public reload(event: string): void {
		const functions = this.get(event);
		this.remove(event);
		functions.forEach(fn => this.add(event, fn));
	}

	public get(event: string): Function[] {
		return this._client.listeners(event);
	}

	public remove(event: string): void {
		return this._client.removeAllListeners(event);
	}
}
