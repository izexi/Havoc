import Logger from '../util/Logger';
import HavocClient from '../client/Havoc';
import HavocGuild from '../extensions/Guild';
import HavocTextChannel from '../extensions/TextChannel';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse } = require('json-buffer');

export default async function(this: HavocClient) {
	this.user!.setActivity('you', { type: 'WATCHING' });
	Logger.log(`${this.user!.tag} is ready in ${this.guilds.size} guilds!`);
	this.supportServer = this.guilds.get('406873117215031297')!;
	this.scheduler.start();
	this.db.category = 'restart';
	const channel = this.channels.get(await this.db.get('restart')) as HavocTextChannel;
	if (channel) {
		const msg = await channel.messages.fetch().then(msgs => msgs.find(m => {
			if (m.author!.id !== this.user!.id && !m.embeds.length) return false;
			if (m.embeds[0].description === '<a:Restarting:411680219636826112> Restarting...') return true;
			return false;
		})).catch(() => null);
		if (msg) {
			await msg.reactions.removeAll();
			await msg.edit(msg.embeds[0].setDescription('<:tick:416985886509498369> Restarted'));
			this.db.delete('restart');
		}
	}
	const query = await this.db.query(`SELECT * FROM "havoc" WHERE "key" ~ '^(config|tags):'`, false, true);
	await Promise.all(query.map(({ key, value }: { key: string; value: string }) => {
		let category;
		[category, key] = key.split(':');
		let guild = this.guilds.get(key) as HavocGuild;
		if (!guild) {
			guild = this.guilds.get(parse(value).guild) as HavocGuild;
			if (!guild) return;
		}
		if (category === 'config') {
			const { logs, prefix } = parse(value);
			if (prefix) guild.prefix = prefix;
			if (logs) guild.logsEnabled = true;
		} else {
			const { name, content } = parse(value);
			guild.tags.set(name, content);
		}
	}));
}
