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
					const option = msg.arg.toLowerCase();
					if (['add', 'delete', 'edit', 'info', 'list'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'would you like to `add`, `delete`, `edit`, `info` or `list` tags to/from server? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `add`, `delete`, `edit`, `info` or `list`'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' }
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['add', 'delete', 'edit', 'info', 'list'].includes(arg));
		handleMessage(this, msg, this.commands.get(`tags-${subCommand}`)!);
	}
}
