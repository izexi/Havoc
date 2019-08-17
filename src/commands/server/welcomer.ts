import Command from '../../structures/bases/Command';
import HavocMessage from '../../extensions/Message';
import HavocClient from '../../client/Havoc';
import { handleMessage } from '../../events/message';

export default class Welcomer extends Command {
	public constructor() {
		super(__filename, {
			opts: 0b1000,
			description: 'Configure the welcomer for the server.',
			args: [{
				key: 'subCommand',
				type: (msg: HavocMessage) => {
					const option = msg.arg;
					if (['enable', 'update', 'disable'].includes(option)) return option;
				},
				prompt: {
					initialMsg: 'would you like to `enable`, `update` or `disable` welcomer for this server? (enter the according option)',
					invalidResponseMsg: 'You will need to enter either `enable`, `update` or `disable`'
				}
			}],
			userPerms: { flags: 'MANAGE_GUILD' },
			usage: [
				'[enable | updated] [{channel}]',
				'[disable]'
			],
			examples: {
				'enable {channel}': 'enables welcomer in the server for the corresponding channel',
				'disable': 'disables welcomer in the server'
			}
		});
	}

	public async run(this: HavocClient, { msg, target: { subCommand } }: { msg: HavocMessage; target: { subCommand: string } }) {
		msg.args = msg.args.filter(arg => !['enable', 'update', 'disable'].includes(arg));
		handleMessage(this, msg, this.commands.get(`welcomer-${subCommand.replace(/update/i, 'enable')}`)!);
	}
}
