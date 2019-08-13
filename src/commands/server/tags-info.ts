import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';

export default class TagsDelete extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'View info about a tag on the server.',
			args: [{
				key: 'tag',
				type: async (msg: HavocMessage) => await msg.client.db.fieldQuery('tags', false, ['guild', msg.guild.id], ['name', msg.text]) || false,
				prompt: {
					initialMsg: 'enter the name of the tag you would like to view',
					invalidResponseMsg: 'I couldn\'t find a tag with that name'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { tag: { name, content, createdBy, createdAt, lastModifiedAt, lastModifiedBy } } }: { msg: HavocMessage; target: { tag: { name: string; content: string; createdBy: string; createdAt: string; lastModifiedAt: string; lastModifiedBy: string } } }) {
		const addField = [
			['❯Name', name],
			['❯Content', Util.codeblock(content)],
			['❯Created by', (await this.users.fetch(createdBy)).tag],
			['❯Created at', `${new Date(createdAt).toLocaleString()} (UTC)`]
		];
		if (lastModifiedAt) {
			addField.push(['❯Last modified by', (await msg.client.users.fetch(lastModifiedBy)).tag]);
			addField.push(['❯Last modified at', `${new Date(lastModifiedAt).toLocaleString()} (UTC)`]);
		}
		msg.sendEmbed({ addField });
	}
}
