import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';

export default class TagsAdd extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Add a tag to the server.',
			args: [{
				key: 'name',
				type: 'tagName',
				prompt: { initialMsg: 'enter what you would like to name the tag' }
			}, {
				key: 'content',
				type: 'string',
				prompt: { initialMsg: 'enter what you would like the content of the tag to be' }
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { name, content } }: { msg: HavocMessage; target: { name: string; content: string } }) {
		if (msg.guild.tags.has(name)) {
			return msg.respond(`A tag with the name \`${name}\` already exists.`);
		}
		if (this.commands.handler.has(name)) {
			return msg.respond(`\`${name}\` is already a command, so you can't use this as a tag name.`);
		}
		const createdAt = Date.now();
		this.db.category = 'tags';
		await this.db.set(createdAt, {
			name,
			content,
			createdAt,
			createdBy: msg.author.id,
			guild: msg.guild.id
		});
		msg.guild.tags.set(name, content);
		msg.respond(`I have created the tag \`${name}\` which you can trigger by entering \`${msg.prefix}${name}\``);
	}
}
