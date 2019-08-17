import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { handleMessage } from '../../events/message';

export default class Tags extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Configure the tags for the server.',
			aliases: new Set(['tag']),
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['add', 'delete', 'edit', 'info', 'list'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'would you like to `add`, `delete`, `edit`, `info` or `list` tags to/from server? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `add`, `delete`, `edit`, `info` or `list`'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' },
			usage: [
				'[add] [name] [content]',
				'[delete] [name]',
				'[edit] [name] [new content]',
				'[info] [name]',
				'[list]'
			],
			examples: {
				'add hi hello': 'adds a tag with the name "hi" that will respond with "hello" when `{prefix}hi` is entered',
				'add "h i" h e l l o': 'adds the tag with the name "h i" that will respond with "h e l l o" when `{prefix}h i` is entered',
				'delete hi': 'delets the tag with the name "hi"',
				'edit hi Hello': 'edits the tag with the name "hi" so that it will now respond with "Hello" when `{prefix}hi` is entered',
				'edit "h i" H e l l o': 'edits the tag with the name "h i" so that it will now respond with "H e l l o" when `{prefix}hi` is entered',
				'info hi': 'view info about the tag with the name "hi"',
				'list': 'view a list of all the tags on the server'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['add', 'delete', 'edit', 'info', 'list'].includes(arg));
		handleMessage(this, msg, this.commands.get(`tags-${subCommand}`)!);
	}
}
