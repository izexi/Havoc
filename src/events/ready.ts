import Logger from '../util/Logger';
import HavocClient from '../client/Havoc';
import HavocGuild from '../extensions/Guild';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse } = require('json-buffer');

export default async function(this: HavocClient) {
	this.user!.setActivity('you', { type: 'WATCHING' });
	Logger.log(`${this.user!.tag} is ready in ${this.guilds.size} guilds!`);
	this.supportServer = this.guilds.get('406873117215031297')!;
	this.scheduler.start();
	const query = await this.db.query(`SELECT * FROM "havoc" WHERE "key" ~ '^(config|webhook|tags):'`, false, true);
	await Promise.all(query.map(({ key, value }: { key: string; value: string }) => {
		let category;
		[category, key] = key.split(':');
		let guild = this.guilds.get(key) as HavocGuild;
		if (!guild) {
			guild = this.guilds.get(parse(value).guild) as HavocGuild;
			if (!guild) return;
		}
		if (category === 'config') {
			const { prefix } = parse(value);
			if (prefix) guild.prefix = prefix;
		} else if (category === 'webhook') {
			guild.logsEnabled = true;
		} else {
			const { name, content } = parse(value);
			guild.tags.set(name, content);
		}
	}));
}
