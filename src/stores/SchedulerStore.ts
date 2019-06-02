import HavocClient from '../client/Havoc';
import Logger from '../util/Logger';
import Schedule from '../structures/bases/Schedule';
import Util from '../util/Util';
import { Collection } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse, stringify } = require('json-buffer');

export default class SchedulerStore extends Collection<number, Schedule> {
	private _client: HavocClient;

	public stopped = false;

	public started = false;

	public constructor(client: HavocClient) {
		super();
		this._client = client;
		this._init();
	}

	public async start() {
		if (this.started) return;
		const scheduleLoop = async () => {
			this.started = true;
			if (this.stopped) return;
			await Promise.all([...this.values()].map(async s => s.update().catch(s.onError)))
				.catch(error => Logger.error('Scheduler error', error));
			setTimeout(scheduleLoop, 1000);
		};
		scheduleLoop();
	}

	public stop() {
		this.stopped = true;
	}

	private async _init() {
		Promise.all(
			['giveaway', 'poll'].map(async _key => this._client.db.pool.query(`SELECT * FROM havoc WHERE key ~ '^${_key}:'`).then(async ({ rows }) => {
				await Promise.all(rows.map(async ({ key, value }) => {
					const endTime = Number(key.split(':')[1]);
					this.set(endTime, new (require(`../schedules/${Util.captialise(_key)}`).default)(this._client, endTime, parse(value)));
				}));
				Logger.info(`Loaded ${_key} schedules.`);
			}))
		).catch(error => Logger.error('Database error when loading schedules', error));
	}

	public async add(category: string, schedule: Schedule) {
		this._client.db.category = category;
		await this._client.db.set(schedule.endTime, schedule);
		return this.set(schedule.endTime, schedule);
	}
}
