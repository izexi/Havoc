import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class TagsEdit extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Edit an existing tag on the server.',
			args: [{
				key: 'name',
				type: 'tagName',
				prompt: { initialMsg: 'enter the name of the tag that you would like to edit' }
			}, {
				key: 'content',
				type: 'string',
				prompt: {
					initialMsg: 'enter what you would like the new content of the tag to be',
					invalidResponseMsg: 'you need to enter the new content of the tag'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { name, content } }: { msg: HavocMessage; target: { name: string; content: string } }) {
		const tag = await msg.client.db.fieldQuery('tags', false, ['guild', msg.guild.id], ['name', name]);
		console.log(content.length);
		if (!tag) {
			return msg.sendEmbed({ setDescription: `**${msg.author.tag}** I couldn't find a tag with the name \`${name}\` on this server.` });
		}
		this.db.category = 'tags';
		await this.db.set(tag.createdAt, {
			name,
			content,
			createdAt: tag.createdAt,
			createdBy: tag.createdBy,
			guild: msg.guild.id,
			lastModifiedAt: Date.now(),
			lastModifiedBy: msg.author.id
		});
		msg.guild.tags.set(name, content);
		msg.sendEmbed({ setDescription: `**${msg.author.tag}** I have edited the tag \`${name}\` which you can trigger by entering \`${msg.prefix}${name}\`` });
	}
}
