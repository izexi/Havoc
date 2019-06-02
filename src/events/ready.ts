import Logger from '../util/Logger';
import HavocClient from '../client/Havoc';
import HavocTextChannel from '../extensions/TextChannel';
import HavocMessage from '../extensions/Message';
import Giveaway from '../schedules/Giveaway';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse, stringify } = require('json-buffer');

export default function(this: HavocClient) {
	this.user!.setActivity('you', { type: 'WATCHING' });
	Logger.log(`${this.user!.tag} is ready in ${this.guilds.size} guilds!`);
	this.supportServer = this.guilds.get('406873117215031297')!;
	/* this.pollScheduler = this.setInterval(() => {
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
	}, 5000); */

	/* this.giveawayScheduler = async () => {
		await Promise.all(
			[...this.giveaways.values()]
				.map(async g => g.update().catch(async () => {
					await g.delete();
					// @ts-ignore
					this.rest.handlers.get(`/channels/${g.channel}/messages/:id`).run();
					return null;
				}))
		);
		setTimeout(this.giveawayScheduler, 1000);

		this.giveawayScheduler();
	*/

	this.scheduler.start();
}
