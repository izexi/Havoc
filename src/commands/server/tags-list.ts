import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import EmbedPagination from '../../structures/EmbedPagination';
import Util from '../../util/Util';
/* eslint-disable @typescript-eslint/no-var-requires */
const { parse } = require('json-buffer');

export default class TagsList extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b0011,
			description: 'View all the tags in the server.'
		});
	}

	public async run(this: HavocClient, { msg }: { msg: HavocMessage }) {
		const tags = await this.db.fieldQuery('tags', true, ['guild', msg.guild.id]);
		if (!tags.length) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** there are no tags in this server.` });
		}
		const descriptions: string[] = await Promise.all(tags
			.map(async ({ value }: { value: string }) => {
				const { name, content, createdBy, createdAt, lastModifiedAt, lastModifiedBy } = parse(value);
				const addField = [
					['Name', name],
					['Content', Util.codeblock(content)],
					['Created by', (await this.users.fetch(createdBy)).tag],
					['Created at', `${new Date(createdAt).toLocaleString()} (UTC)`]
				];
				if (lastModifiedAt) {
					addField.push(['Last modified by', (await msg.client.users.fetch(lastModifiedBy)).tag]);
					addField.push(['Last modified at', `${new Date(lastModifiedAt).toLocaleString()} (UTC)`]);
				}
				return addField.map(([title, _value]) => `**${title}**:\n${_value}\n`).join('\n');
			}));
		new EmbedPagination({
			msg,
			title: `Currently muted members`,
			descriptions,
			maxPerPage: 1,
			page: Number(msg.args[0]),
			hastebin: true
		});
	}
}
