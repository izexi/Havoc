import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import Util from '../../util/Util';

export default class TagsDelete extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Delete a tag from the server.',
			args: [{
				key: 'tag',
				type: async (msg: HavocMessage) => await msg.client.db.fieldQuery('tags', false, ['guild', msg.guild.id], ['name', msg.text]) || false,
				prompt: {
					initialMsg: 'enter the name of the tag you would like to delete',
					invalidResponseMsg: 'I couldn\'t find a tag with that name'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { tag: { name, content, createdBy, createdAt, lastModifiedAt, lastModifiedBy } } }: { msg: HavocMessage; target: { tag: { name: string; content: string; createdBy: string; createdAt: string; lastModifiedAt: string; lastModifiedBy: string } } }) {
		msg.guild.tags.delete(name);
		this.db.category = 'tags';
		await this.db.delete(createdAt);
		msg.respond(`I have deleted the \`${name}\` tag which was created by ${(await this.users.fetch(createdBy)).tag} on ${new Date(createdAt).toLocaleString()} (UTC) that had the content ${lastModifiedAt ? `(last modified by ${(await this.users.fetch(lastModifiedBy)).tag} on ${new Date(lastModifiedAt).toLocaleString()})` : ''}:
				${Util.codeblock(content)}`);
	}
}
