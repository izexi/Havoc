import { Collection } from 'discord.js';
import HavocClient from '../client/Havoc';
import Giveaway from '../structures/Giveaway';
import Logger from '../util/Logger';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse } = require('json-buffer');

export default class GiveawayStore extends Collection<number, Giveaway> {
	private _client: HavocClient;

	public constructor(client: HavocClient) {
		super();
		this._client = client;
		this._init();
	}

	private async _init() {
		await this._client.db.pool.query(`SELECT * FROM havoc WHERE key ~ '^giveaway:'`).then(async ({ rows }) => {
			await Promise.all(rows.map(async ({ key, value }) =>
				this._client.giveaways.add(Number(key.split(':')[1]), parse(value))));
		}).catch(error => Logger.error('Database error:', error));
		Logger.status(`Loaded ${this.size} giveaways.`);
	}

	public async add(key: number, opts: { channel: string; message: string; winners: string }, db: boolean = false) {
		this._client.db.category = 'giveaway';
		if (db) await this._client.db.set(key, opts);
		return this.set(key, new Giveaway(this._client, key, opts));
	}

	public async remove(key: number) {
		if (this.has(key)) await this.get(key)!.end();
		return this.delete(key);
	}
}
