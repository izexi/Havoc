/* eslint-disable @typescript-eslint/no-var-requires */
import Logger from '../util/Logger';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';
import HavocMessage from '../extensions/Message';
const { parse } = require('json-buffer');
const interval = require('interval-promise');


export default function(this: HavocClient) {
	this.user!.setActivity('you', { type: 'WATCHING' });
	Logger.log(`${this.user!.tag} is ready in ${this.guilds.size} guilds!`);
	this.supportServer = this.guilds.get('406873117215031297')!;
	this.pollScheduler = this.setInterval(() => {
		this.db.category = 'poll';
		this.db.lessThan(Date.now())
			.then(res => {
				if (!res) return;
				const { key, value } = res;
				const { channel, message, options } = parse(value);
				// eslint-disable-next-line promise/no-nesting
				(this.channels.get(channel)! as HavocTextChannel).messages.fetch(message)
					.then(async msg => (msg as HavocMessage).endPoll(options))
					.catch(() => null);
				this.db.delete(key.slice(5));
			})
			.catch(error => Logger.error('Database error:', error));
	}, 5000);

	this.giveawayScheduler = interval(async () => {
		if (!this.giveawaySchedule) return;
		await Promise.all([...this.giveaways.values()].map(async g => g.update()));
	}, 1000);
}
