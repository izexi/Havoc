import { Guild, Client } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { prefix } = require('../../config.json');

export default class HavocGuild extends Guild {
	public prefix = prefix;

	private _config = null;

	public get config(): object {
		const cached = this._config;
		if (cached) return Promise.resolve(cached);
		return ({});
	}
}
