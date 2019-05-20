import { Guild } from 'discord.js';
import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require('../../config.json');

export default class HavocGuild extends Guild {
	public client!: HavocClient;

	public prefix = prefix;

	private _config: any = null;

	public get config() {
		const cached = this._config;
		if (cached) return Promise.resolve(cached);
		this.client.db.category = 'config';
		return this.client.db.get(this.id)
			.then(async res => this._config = res || {})
			.catch(() => ({}));
	}

	public async updateConfig(obj: object) {
		this.client.db.category = 'config';
		const updated = { ...(await this.config), ...obj };
		this.client.db.set(this.id, updated)
			.then(async () => this._config = updated)
			.catch(error => Logger.error('Database error while updating guild config', error));
	}
}
